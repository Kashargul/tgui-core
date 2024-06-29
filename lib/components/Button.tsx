import { Placement } from '@popperjs/core';
import {
  ChangeEvent,
  createRef,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { KEY } from '../common/keys';
import { BooleanLike, classes } from '../common/react';
import styles from '../styles/components/Button.module.scss';
import { Box, BoxProps, computeBoxClassName, computeBoxProps } from './Box';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';

/**
 * Getting ellipses to work requires that you use:
 * 1. A string rather than a node
 * 2. A fixed width here or in a parent
 * 3. Children prop rather than content
 */
type EllipsisUnion =
  | {
      children: string;
      /** @deprecated use children instead */
      content?: never;
      ellipsis: true;
    }
  | Partial<{
      children: ReactNode;
      /** @deprecated use children instead */
      content: ReactNode;
      ellipsis: undefined;
    }>;

type Props = Partial<{
  captureKeys: boolean;
  circular: boolean;
  compact: boolean;
  disabled: BooleanLike;
  fluid: boolean;
  icon: string | false;
  iconColor: string;
  iconPosition: string;
  iconRotation: number;
  iconSpin: BooleanLike;
  onClick: (e: any) => void;
  selected: BooleanLike;
  tooltip: ReactNode;
  tooltipPosition: Placement;
  verticalAlignContent: string;
}> &
  EllipsisUnion &
  BoxProps;

/** Clickable button. Comes with variants. Read more in the documentation. */
export function Button(props: Props) {
  const {
    captureKeys = true,
    children,
    circular,
    className,
    color,
    compact,
    content,
    disabled,
    ellipsis,
    fluid,
    icon,
    iconColor,
    iconPosition,
    iconRotation,
    iconSpin,
    onClick,
    selected,
    tooltip,
    tooltipPosition,
    verticalAlignContent,
    ...rest
  } = props;

  const toDisplay: ReactNode = content || children;

  let buttonContent = (
    <div
      className={classes([
        styles.button,
        fluid && styles.fluid,
        disabled && styles.disabled,
        selected && styles.selected,
        circular && styles.circular,
        compact && styles.compact,
        verticalAlignContent && styles.flex,
        verticalAlignContent && fluid && styles.flex__fluid,
        verticalAlignContent &&
          styles['verticalAlignContent__' + verticalAlignContent],
        color && typeof color === 'string'
          ? styles['color__' + color]
          : styles['color__default'],
        className,
        computeBoxClassName(rest),
      ])}
      tabIndex={!disabled ? 0 : undefined}
      onClick={(event) => {
        if (!disabled && onClick) {
          onClick(event);
        }
      }}
      onKeyDown={(event) => {
        if (!captureKeys) {
          return;
        }

        // Simulate a click when pressing space or enter.
        if (event.key === KEY.Space || event.key === KEY.Enter) {
          event.preventDefault();
          if (!disabled && onClick) {
            onClick(event);
          }
          return;
        }

        // Refocus layout on pressing escape.
        if (event.key === KEY.Escape) {
          event.preventDefault();
        }
      }}
      {...computeBoxProps(rest)}
    >
      <div className={styles.content}>
        {icon && iconPosition !== 'right' && (
          <Icon
            mr={1}
            name={icon}
            color={iconColor}
            rotation={iconRotation}
            spin={iconSpin}
          />
        )}
        {!ellipsis ? (
          toDisplay
        ) : (
          <span
            className={classes([styles.ellipsis, icon && styles.textMargin])}
          >
            {toDisplay}
          </span>
        )}
        {icon && iconPosition === 'right' && (
          <Icon
            ml={1}
            name={icon}
            color={iconColor}
            rotation={iconRotation}
            spin={iconSpin}
          />
        )}
      </div>
    </div>
  );

  if (tooltip) {
    buttonContent = (
      <Tooltip content={tooltip} position={tooltipPosition as Placement}>
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
}

type CheckProps = Partial<{
  checked: BooleanLike;
}> &
  Props;

/** Visually toggles between checked and unchecked states. */
export function ButtonCheckbox(props: CheckProps) {
  const { checked, ...rest } = props;

  return (
    <Button
      color="transparent"
      icon={checked ? 'check-square-o' : 'square-o'}
      selected={checked}
      {...rest}
    />
  );
}

Button.Checkbox = ButtonCheckbox;

type ConfirmProps = Partial<{
  confirmColor: string;
  confirmContent: ReactNode;
  confirmIcon: string;
}> &
  Props;

/**  Requires user confirmation before triggering its action. */
function ButtonConfirm(props: ConfirmProps) {
  const {
    children,
    color,
    confirmColor = 'bad',
    confirmContent = 'Confirm?',
    confirmIcon,
    ellipsis = true,
    icon,
    onClick,
    ...rest
  } = props;
  const [clickedOnce, setClickedOnce] = useState(false);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (!clickedOnce) {
      setClickedOnce(true);
      return;
    }

    onClick?.(event);
    setClickedOnce(false);
  }

  return (
    <Button
      icon={clickedOnce ? confirmIcon : icon}
      color={clickedOnce ? confirmColor : color}
      onClick={handleClick}
      {...rest}
    >
      {clickedOnce ? confirmContent : children}
    </Button>
  );
}

Button.Confirm = ButtonConfirm;

type InputProps = Partial<{
  currentValue: string;
  defaultValue: string;
  fluid: boolean;
  maxLength: number;
  onCommit: (e: any, value: string) => void;
  placeholder: string;
}> &
  Props;

/** Accepts and handles user input. */
function ButtonInput(props: InputProps) {
  const {
    children,
    color = 'default',
    content,
    currentValue,
    defaultValue,
    disabled,
    fluid,
    icon,
    iconRotation,
    iconSpin,
    maxLength,
    onCommit = () => null,
    placeholder,
    tooltip,
    tooltipPosition,
    ...rest
  } = props;
  const [inInput, setInInput] = useState(false);
  const inputRef = createRef<HTMLInputElement>();

  const toDisplay = content || children;

  function commitResult(e) {
    const input = inputRef.current;
    if (!input) return;

    const hasValue = input.value !== '';
    if (hasValue) {
      onCommit(e, input.value);
    } else {
      if (defaultValue) {
        onCommit(e, defaultValue);
      }
    }
  }

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (inInput) {
      input.value = currentValue || '';
      try {
        input.focus();
        input.select();
      } catch {
        // Ignore errors
      }
    }
  }, [inInput, currentValue]);

  let buttonContent = (
    <Box
      className={classes([
        styles.button,
        fluid && styles.fluid,
        styles['color__' + color],
      ])}
      {...rest}
      onClick={() => setInInput(true)}
    >
      {icon && <Icon name={icon} rotation={iconRotation} spin={iconSpin} />}
      <div>{toDisplay}</div>
      <input
        disabled={!!disabled}
        ref={inputRef}
        className="NumberInput__input"
        style={{
          display: !inInput ? 'none' : '',
          textAlign: 'left',
        }}
        onBlur={(event) => {
          if (!inInput) {
            return;
          }
          setInInput(false);
          commitResult(event);
        }}
        onKeyDown={(event) => {
          if (event.key === KEY.Enter) {
            setInInput(false);
            commitResult(event);
            return;
          }
          if (event.key === KEY.Escape) {
            setInInput(false);
          }
        }}
      />
    </Box>
  );

  if (tooltip) {
    buttonContent = (
      <Tooltip content={tooltip} position={tooltipPosition as Placement}>
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
}

Button.Input = ButtonInput;

type FileProps = {
  accept: string;
  multiple?: boolean;
  onSelectFiles: (files: string | string[]) => void;
} & Props;

/**  Accepts file input */
function ButtonFile(props: FileProps) {
  const { accept, multiple, onSelectFiles, ...rest } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  async function read(files: FileList) {
    const promises = Array.from(files).map((file) => {
      const reader = new FileReader();

      return new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(file);
      });
    });

    return await Promise.all(promises);
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files?.length) {
      const readFiles = await read(files);
      onSelectFiles(multiple ? readFiles : readFiles[0]);
    }
  }

  return (
    <>
      <Button onClick={() => inputRef.current?.click()} {...rest} />
      <input
        hidden
        type="file"
        ref={inputRef}
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />
    </>
  );
}

Button.File = ButtonFile;
