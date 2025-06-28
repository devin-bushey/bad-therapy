import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchJournalWritingPrompts } from '../services/journalWritingPromptsService'
import { Editor } from '@tiptap/react'

interface JournalPrompt {
  text: string
  title: string
}

export function useJournalWritingPrompts(editor?: Editor, onTitleUpdate?: (title: string) => void) {
  const { getAccessTokenSilently } = useAuth0()
  const [promptObjects, setPromptObjects] = useState<JournalPrompt[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLightbulbClick = async () => {
    setPromptObjects([])
    setShowSuggestions(true)
    setLoading(true)
    try {
      const token = await getAccessTokenSilently()
      const prompts = await fetchJournalWritingPrompts({ token })
      setPromptObjects(prompts ?? [])
    } finally {
      setLoading(false)
    }
  }

  const handlePromptClick = (promptObj: JournalPrompt) => {
    setPromptObjects([])
    setShowSuggestions(false)
    
    // Update the journal title with server-provided title
    if (onTitleUpdate && promptObj.title) {
      onTitleUpdate(promptObj.title)
    }
    
    // Insert the prompt into the TipTap editor
    if (editor) {
      // Get current content length to determine if we should add spacing
      const currentText = editor.getText()
      const needsSpacing = currentText.trim().length > 0
      
      // Insert the prompt with appropriate spacing
      const promptText = needsSpacing ? `\n\n${promptObj.text}\n\n` : `${promptObj.text}\n\n`
      
      editor.commands.focus()
      editor.commands.insertContent(promptText)
    }
  }

  // Convert prompt objects to strings for SuggestedPrompts component
  const promptStrings = promptObjects.map(p => p.text)
  
  // Wrapper function to handle string-based prompt clicks from SuggestedPrompts component
  const handlePromptStringClick = (promptText: string) => {
    const promptObj = promptObjects.find(p => p.text === promptText)
    if (promptObj) {
      handlePromptClick(promptObj)
    }
  }

  return {
    suggestedPrompts: promptStrings,
    setSuggestedPrompts: setPromptObjects,
    showSuggestions,
    setShowSuggestions,
    loading,
    handleLightbulbClick,
    handlePromptClick: handlePromptStringClick
  }
}