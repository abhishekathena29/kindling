import React from 'react';
import { Linking, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';

/**
 * Lightweight Markdown renderer for AI chat replies.
 *
 * Supports: # headings, - / * / • bullet lists, 1. numbered lists, > quotes,
 * --- dividers, paragraphs, **bold**, *italic* / _italic_, `code` and [links](url).
 * Deliberately dependency-free; unsupported syntax falls back to plain text.
 */

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'bullet'; text: string; indent: number }
  | { type: 'numbered'; marker: string; text: string; indent: number }
  | { type: 'quote'; text: string }
  | { type: 'divider' }
  | { type: 'paragraph'; text: string };

const parseBlocks = (markdown: string): Block[] => {
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };

  // Drop code fences; their content is shown as plain lines.
  const lines = markdown.replace(/\r\n/g, '\n').replace(/^```.*$/gm, '').split('\n');

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const trimmed = line.trim();
    const indent = Math.min(Math.floor((line.length - line.trimStart().length) / 2), 3);
    let m: RegExpMatchArray | null;

    if (!trimmed) {
      flushParagraph();
    } else if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'divider' });
    } else if ((m = trimmed.match(/^(#{1,6})\s+(.*)$/))) {
      flushParagraph();
      blocks.push({ type: 'heading', level: m[1].length, text: m[2].replace(/\s*#+$/, '') });
    } else if ((m = trimmed.match(/^[-*+•]\s+(.*)$/))) {
      flushParagraph();
      blocks.push({ type: 'bullet', text: m[1], indent });
    } else if ((m = trimmed.match(/^(\d+)[.)]\s+(.*)$/))) {
      flushParagraph();
      blocks.push({ type: 'numbered', marker: `${m[1]}.`, text: m[2], indent });
    } else if ((m = trimmed.match(/^>\s?(.*)$/))) {
      flushParagraph();
      blocks.push({ type: 'quote', text: m[1] });
    } else {
      paragraph.push(trimmed);
    }
  }
  flushParagraph();
  return blocks;
};

// Order matters: code first (its content is literal), then links, bold, italic.
const INLINE_PATTERN =
  /(`[^`]+`)|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

const renderInline = (text: string, baseKey: string, linkStyle: StyleProp<TextStyle>): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const token = match[0];
    const key = `${baseKey}-${index++}`;

    if (match[1]) {
      nodes.push(<Text key={key} style={styles.code}>{token.slice(1, -1)}</Text>);
    } else if (match[2]) {
      const [, label, url] = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/) ?? [];
      nodes.push(
        <Text key={key} style={linkStyle} onPress={() => Linking.openURL(url).catch(() => {})}>
          {renderInline(label, key, linkStyle)}
        </Text>,
      );
    } else if (match[3]) {
      nodes.push(<Text key={key} style={styles.bold}>{renderInline(token.slice(2, -2), key, linkStyle)}</Text>);
    } else if (match[4]) {
      nodes.push(<Text key={key} style={styles.italic}>{renderInline(token.slice(1, -1), key, linkStyle)}</Text>);
    }
    last = start + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
};

interface MarkdownTextProps {
  children: string;
  /** Base text style (font size, colour, line height). */
  style?: StyleProp<TextStyle>;
  /** Colour for links, bullets and quote bars. */
  accentColor?: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ children, style, accentColor = '#38A389' }) => {
  const blocks = parseBlocks(children ?? '');
  const linkStyle = [styles.link, { color: accentColor }];
  const flat = StyleSheet.flatten(style) ?? {};
  const baseSize = flat.fontSize ?? 15;

  return (
    <View>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        const isFirst = i === 0;
        switch (block.type) {
          case 'heading': {
            const size = baseSize + (block.level === 1 ? 4 : block.level === 2 ? 2 : 1);
            return (
              <Text
                key={key}
                style={[style, styles.heading, { fontSize: size, lineHeight: size * 1.35 }, isFirst && styles.noTop]}
              >
                {renderInline(block.text, key, linkStyle)}
              </Text>
            );
          }
          case 'bullet':
          case 'numbered':
            return (
              <View key={key} style={[styles.listRow, { marginLeft: block.indent * 14 }, isFirst && styles.noTop]}>
                <Text style={[style, styles.listMarker, { color: accentColor }]}>
                  {block.type === 'bullet' ? '•' : block.marker}
                </Text>
                <Text style={[style, styles.listText]}>{renderInline(block.text, key, linkStyle)}</Text>
              </View>
            );
          case 'quote':
            return (
              <View key={key} style={[styles.quote, { borderLeftColor: accentColor }, isFirst && styles.noTop]}>
                <Text style={[style, styles.italic]}>{renderInline(block.text, key, linkStyle)}</Text>
              </View>
            );
          case 'divider':
            return <View key={key} style={styles.divider} />;
          default:
            return (
              <Text key={key} style={[style, styles.paragraph, isFirst && styles.noTop]}>
                {renderInline(block.text, key, linkStyle)}
              </Text>
            );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  paragraph: { marginTop: 8 },
  heading: { fontWeight: '700', marginTop: 12, marginBottom: 2 },
  noTop: { marginTop: 0 },
  listRow: { flexDirection: 'row', marginTop: 4 },
  listMarker: { minWidth: 18, fontWeight: '700' },
  listText: { flex: 1 },
  quote: { borderLeftWidth: 3, paddingLeft: 10, marginTop: 8 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#D0D5DA', marginVertical: 10 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  code: { fontFamily: 'monospace', backgroundColor: '#EEF1F3', fontSize: 13 },
  link: { textDecorationLine: 'underline' },
});
