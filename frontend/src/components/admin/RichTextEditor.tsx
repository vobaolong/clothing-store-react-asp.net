import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/react'
import { Button } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type RichTextEditorProps = {
  value?: string
  onChange?: (value: string) => void
}

export default function RichTextEditor({
  value,
  onChange
}: RichTextEditorProps) {
  const { t } = useTranslation()
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'min-h-[180px] rounded-b-md border border-t-0 border-slate-200 p-3 outline-none'
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML())
    }
  })

  useEffect(() => {
    if (!editor) return
    const nextValue = value || '<p></p>'
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return null

  const insertImage = () => {
    const imageUrl = window.prompt(t('admin.imageUrlPrompt') as string)
    if (!imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
  }

  return (
    <div>
      <div className="flex flex-wrap p-2 border gap-2 rounded-t-md card">
        <Button
          size="small"
          type={editor.isActive('bold') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          {t('common.bold')}
        </Button>
        <Button
          size="small"
          type={editor.isActive('italic') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          {t('common.italic')}
        </Button>
        <Button
          size="small"
          type={editor.isActive('bulletList') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          {t('common.bullet')}
        </Button>
        <Button size="small" onClick={insertImage}>
          {t('common.upload')}
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
