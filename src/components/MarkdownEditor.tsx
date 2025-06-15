import MDEditor from '@uiw/react-md-editor';
import { useLanguage } from '../contexts/LanguageContext';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: number;
}

const MarkdownEditor = ({ value, onChange, height = 500 }: MarkdownEditorProps) => {
  const { language } = useLanguage();

  const labels = {
    ko: {
      toolbar: {
        bold: '굵게',
        italic: '기울임',
        header: '제목',
        quote: '인용',
        link: '링크',
        code: '코드',
        image: '이미지',
        list: '목록',
        preview: '미리보기',
        edit: '편집',
        both: '나란히',
      },
    },
    en: {
      toolbar: {
        bold: 'Bold',
        italic: 'Italic', 
        header: 'Header',
        quote: 'Quote',
        link: 'Link',
        code: 'Code',
        image: 'Image',
        list: 'List',
        preview: 'Preview',
        edit: 'Edit',
        both: 'Split',
      },
    },
    ja: {
      toolbar: {
        bold: '太字',
        italic: '斜体',
        header: '見出し',
        quote: '引用',
        link: 'リンク',
        code: 'コード',
        image: '画像',
        list: 'リスト',
        preview: 'プレビュー',
        edit: '編集',
        both: '分割',
      },
    },
  };

  return (
    <div data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview="live"
        textareaProps={{
          placeholder: language === 'ko' ? '마크다운으로 작성하세요...' : 
                       language === 'ja' ? 'マークダウンで書いてください...' : 
                       'Write in markdown...',
        }}
      />
    </div>
  );
};

export default MarkdownEditor;