import { ReactNode, useState } from 'react';

import { Box, BoxProps } from './Box';
import { Button } from './Button';

type Props = Partial<{
  buttons: ReactNode;
  icon: string;
  open: boolean;
  title: ReactNode;
}> &
  BoxProps;

export function Collapsible(props: Props) {
  const { children, color, title, buttons, icon, ...rest } = props;
  const [open, setOpen] = useState(props.open);

  return (
    <Box mb={1}>
      <div className="Table">
        <div className="Table__cell">
          <Button
            fluid
            color={color}
            icon={icon ? icon : open ? 'chevron-down' : 'chevron-right'}
            onClick={() => setOpen(!open)}
            {...rest}
          >
            {title}
          </Button>
        </div>
        {buttons && (
          <div className="Table__cell Table__cell--collapsing">{buttons}</div>
        )}
      </div>
      {open && <Box mt={1}>{children}</Box>}
    </Box>
  );
}
