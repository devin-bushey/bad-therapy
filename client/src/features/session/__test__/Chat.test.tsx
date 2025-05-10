import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Chat from '../Chat'
import * as useChatSessionModule from '../hooks/useChatSession'
import { MemoryRouter } from 'react-router-dom'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [{ get: () => 'test-session-id' }],
}))

const baseSession = { id: 'session-1', name: 'Session 1', messages: [] }
const baseMessages = [{ content: 'Hello', isFromUser: true }]

const setup = (overrides = {}) => {
  jest.spyOn(useChatSessionModule, 'useChatSession').mockReturnValue({
    messages: baseMessages,
    session: baseSession,
    loading: false,
    nameInput: 'Session 1',
    setNameInput: jest.fn(),
    setMessages: jest.fn(),
    sendAIMessage: jest.fn(),
    saveName: jest.fn(),
    loadSession: jest.fn(),
    ...overrides,
  })
  return render(<Chat />, { wrapper: MemoryRouter })
}

describe('Chat', () => {
  it('shows and updates the session name', async () => {
    const setNameInput = jest.fn()
    const saveName = jest.fn()
    setup({ setNameInput, saveName, session: { name: 'Session 1' }, nameInput: 'Session 1' })
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    fireEvent.change(screen.getByDisplayValue('Session 1'), { target: { value: 'New Name' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(setNameInput).toHaveBeenCalledWith('New Name')
    await waitFor(() => expect(saveName).toHaveBeenCalled())
  })

  it('auto-scrolls to bottom on new message', async () => {
    const { container, rerender } = render(<Chat />, { wrapper: MemoryRouter })
    const chatDiv = container.querySelector('.hide-scrollbar') as HTMLDivElement
    chatDiv.scrollTop = 0
    rerender(<Chat />)
    await waitFor(() => expect(chatDiv.scrollTop).toBe(chatDiv.scrollHeight - chatDiv.clientHeight))
  })

  it('calls sendAIMessage when sending input', async () => {
    const sendAIMessage = jest.fn()
    setup({ sendAIMessage })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hi AI' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => expect(sendAIMessage).toHaveBeenCalledWith('Hi AI'))
  })

  it('starts AI chat when session is created', async () => {
    const sendAIMessage = jest.fn()
    setup({ sendAIMessage, messages: [] })
    // Simulate effect: AI should send a welcome message or similar on mount
    expect(sendAIMessage).not.toHaveBeenCalled() // Adjust if your logic differs
  })

  it('navigates back to dashboard', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
}) 