import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { MarkdownText } from '../src/components/MarkdownText';

const render = (md: string) => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<MarkdownText>{md}</MarkdownText>);
  });
  return tree;
};

const textOf = (node: ReactTestRenderer.ReactTestInstance): string =>
  node.children.map(c => (typeof c === 'string' ? c : textOf(c))).join('');

test('renders headings, lists and inline styles without raw markdown symbols', () => {
  const tree = render(
    '### Calm bedtime\n\nTry **one** small step:\n\n- Put *phones* away\n- Ask `one` question\n\n1. Listen\n2. Reflect',
  );
  const all = tree.root.findAllByType(Text).map(textOf).join('\n');

  expect(all).toContain('Calm bedtime');
  expect(all).toContain('Try one small step:');
  expect(all).toContain('•');
  expect(all).toContain('1.');
  expect(all).not.toMatch(/\*\*|###|`/);

  const bold = tree.root
    .findAllByType(Text)
    .find(t => textOf(t) === 'one' && JSON.stringify(t.props.style).includes('"fontWeight":"700"'));
  expect(bold).toBeDefined();
});

test('plain text passes through unchanged', () => {
  const tree = render('Just a friendly reply.');
  expect(tree.root.findAllByType(Text).map(textOf)).toContain('Just a friendly reply.');
});
