import React from 'react';
import NextLink from 'next/link';

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  as?: string;
  href: string;
}

const Link = ({ className, href, as, children, ...props }: Props) => {
  return (
    <NextLink href={href} as={as}>
      <a className={className} {...props}>
        {children}
      </a>
    </NextLink>
  );
};

export default Link;
