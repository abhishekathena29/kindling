import React, { useEffect, useMemo, useState } from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export type InterpolationValues = Record<string, string | number>;

export interface LocalizedTextProps extends TextProps {
  value?: string;
  interpolate?: InterpolationValues;
  translate?: boolean;
}

const formatWithValues = (template: string, values?: InterpolationValues) => {
  if (values == null) {
    return template;
  }
  return template.replace(/{(\w+)}/g, (match, key) => {
    if (values[key] === undefined) {
      return match;
    }
    return String(values[key]);
  });
};

const buildTokenizedString = (template: string, values?: InterpolationValues) => {
  let encoded = template;
  const tokens: Record<string, string> = {};
  if (values == null) {
    return { encoded, tokens };
  }

  Object.entries(values).forEach(([key, value]) => {
    const placeholder = `__KG_${key.toUpperCase()}__`;
    tokens[placeholder] = String(value);
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    encoded = encoded.replace(regex, placeholder);
  });

  return { encoded, tokens };
};

const decodeTokens = (text: string, tokens: Record<string, string>) => {
  let decoded = text;
  Object.entries(tokens).forEach(([token, value]) => {
    decoded = decoded.split(token).join(value);
  });
  return decoded;
};

export const LocalizedText: React.FC<LocalizedTextProps> = ({
  children,
  value,
  interpolate,
  translate = true,
  ...textProps
}) => {
  const { language, translate: translateText } = useLanguage();
  const baseValue = value ?? (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);

  const placeholderData = useMemo(() => {
    if (baseValue == null) {
      return {
        english: undefined as string | undefined,
        encoded: undefined as string | undefined,
        tokens: {} as Record<string, string>,
      };
    }
    const english = formatWithValues(baseValue, interpolate);
    const { encoded, tokens } = buildTokenizedString(baseValue, interpolate);
    return { english, encoded, tokens };
  }, [baseValue, interpolate]);

  const [displayText, setDisplayText] = useState<string | undefined>(placeholderData.english);

  useEffect(() => {
    if (placeholderData.english == null) {
      setDisplayText(undefined);
      return;
    }

    setDisplayText(placeholderData.english);

    if (translate === false || language === 'en') {
      return;
    }

    let isMounted = true;
    translateText(placeholderData.encoded ?? placeholderData.english)
      .then(result => {
        if (isMounted === false) {
          return;
        }
        const decoded = Object.keys(placeholderData.tokens).length > 0
          ? decodeTokens(result, placeholderData.tokens)
          : result;
        setDisplayText(decoded ?? placeholderData.english);
      })
      .catch(() => {
        if (isMounted === false) {
          return;
        }
        setDisplayText(placeholderData.english);
      });

    return () => {
      isMounted = false;
    };
  }, [placeholderData, language, translate, translateText]);

  const content = placeholderData.english != null ? displayText ?? placeholderData.english : children;

  return <RNText {...textProps}>{content}</RNText>;
};
