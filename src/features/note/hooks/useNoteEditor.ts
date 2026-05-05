import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useEffect } from 'react';

interface UseNoteEditorOptions {
  content: string;
  onContentChange: (html: string) => void;
}

export function useNoteEditor({ content, onContentChange }: UseNoteEditorOptions) {
  const { t } = useLanguage();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: t.note.placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const ext = editor.extensionManager.extensions.find((e) => e.name === 'placeholder');
    if (ext) {
      ext.options.placeholder = t.note.placeholder;
      editor.view.dispatch(editor.view.state.tr);
    }
  }, [editor, t.note.placeholder]);

  return editor;
}
