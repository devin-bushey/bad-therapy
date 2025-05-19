/* eslint-disable */
import { useEffect, useRef, useState } from 'react'

interface Props {
  editor: any
  token: string | null
  saveMutation: any
  delay?: number
}

export function useDebouncedAutoSave({ editor, token, saveMutation, delay = 3000 }: Props): { handleSave: () => Promise<void> } {
  const [lastSaved, setLastSaved] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSave = async () => {
    if (!editor || !token) return
    const content = JSON.stringify(editor.getJSON())
    if (content === lastSaved) return
    await saveMutation.mutateAsync(editor.getJSON())
    setLastSaved(content)
  }

  // Save the content when the editor changes
  useEffect(() => {
    if (!editor || !token) return
    const content = JSON.stringify(editor.getJSON())
    if (content === lastSaved) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(handleSave, delay)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [editor?.getJSON(), token])

  // Save the content when the component unmounts
  useEffect(() => {
    return () => { void handleSave() }
  }, [editor, token, lastSaved])

  return { handleSave }
} 