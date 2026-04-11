'use client';

import React from 'react';

/**
 * Renders a string with "Nex" italicised wherever "VentureNex" appears.
 * Use this instead of plain `{t('key')}` for any translation that contains the brand name.
 *
 * Usage: <BrandText text={t('someKey')} />
 *        <BrandText text={t('someKey')} as="h1" className="text-3xl font-bold" />
 */
export default function BrandText({
  text,
  as = 'span',
  className,
}: {
  text: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'li';
  className?: string;
}) {
  const Tag = as;

  if (!text.includes('VentureNex')) {
    return <Tag className={className}>{text}</Tag>;
  }

  const parts = text.split(/(VentureNex)/g);
  return (
    <Tag className={className}>
      {parts.map((part, i) =>
        part === 'VentureNex' ? (
          <React.Fragment key={i}>
            Venture<em>Nex</em>
          </React.Fragment>
        ) : (
          part
        )
      )}
    </Tag>
  );
}
