/*
 *    Copyright 2023 CROZ d.o.o, the original author or authors.
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

import * as React from "react";

import { DialogOverlay, DialogContent } from "@reach/dialog";

import { ComponentTokens, cx, TokenProps, useIcon, useTokens } from "@tiller-ds/theme";
import { createNamedContext } from "@tiller-ds/util";

export type ModalProps<T = unknown> = {
  /**
   * Enables or disables dismiss button (x) on the modal.
   */
  canDismiss?: boolean;

  /**
   * Modal content (not exclusively text).
   * Can also be a function which receives state as a parameter, suitable
   * for actions like showing an updated number of times the modal was open.
   */
  children: React.ReactNode | ((state: T) => React.ReactNode);

  /**
   * Icon shown on the left side of the modal title.
   */
  icon?: React.ReactNode;
} & UseModal<T> &
  ModalTokensProps;

type ModalTokensProps = {
  tokens?: ComponentTokens<"Modal">;
};

type ModalContentProps = {
  /**
   * Modal title (not exclusively text).
   */
  title: React.ReactNode;

  children?: React.ReactNode;
} & TokenProps<"Modal">;

type ModalDismissProps = {
  /**
   * Use aria-label to ensure an accessible name is provided when none is visible in the DOM for all interactive elements.
   * In this case ariaLabel is passed to Button component. Buttons should always have an accessible name.
   * For most buttons, this name will be the same as the text inside the button, between the opening and closing tags.
   * In some cases, for example buttons represented by icons, the accessible name may be provided from the aria-label attribute.
   */
  ariaLabel?: string;

  /**
   * Icon uses for dismiss button
   */
  dismissIcon?: React.ReactElement;
} & TokenProps<"Modal">;

type ModalFooterProps = {
  children?: React.ReactNode;
} & TokenProps<"Modal">;

type ModalIconProps = {
  /**
   * Modal icon classnames.
   */
  className?: string;

  /**
   * Icon used.
   */
  icon: React.ReactElement;
} & TokenProps<"Modal">;

export type UseModal<T = unknown> = {
  /**
   * Indicates whether the modal is opened or not.
   * Called on a variable initialized with 'useModal()'.
   */
  isOpen: boolean;

  /**
   * Function for closing the modal. Called upon a variable initialized with 'useModal()'.
   * Most often used in functions called after an action has been executed by, for example,
   * clicking a button on the modal. By default, only the dismiss button executes this action.
   */
  onClose: () => void;

  /**
   * Function for opening the modal. Called upon a variable initialized with 'useModal()'.
   * Most often used in onClick functions (ex. inside the onClick prop of the Button component)
   */
  onOpen: (value: T | null) => void;

  /**
   * Used for fetching or storing the state of the modal. Called upon a variable initialized with 'useModal()'.
   * Can store simple or complex types. The state stores a value given to the modal in the 'onOpen' function.
   * For example, if you want to pass a string value to a modal onOpen, you would define the modal as
   * 'const modal = useModal<string>()' and open the modal with 'modal.onOpen('someString')'.
   */
  state: T | null;
};

type ModalContext = {
  onClose: () => void;
};

const ModalContext = createNamedContext<ModalContext>("ModalContext");

export function useModal<T = unknown>(): UseModal<T> {
  const [isOpen, setIsOpen] = React.useState(false);
  const [state, setState] = React.useState<T | null>(null);

  const onOpen = (value: T | null) => {
    setIsOpen(true);
    setState(value);
  };

  const onClose = () => setIsOpen(false);

  return { isOpen, onOpen, onClose, state };
}

function useModalContext() {
  const context = React.useContext(ModalContext);

  if (!context) {
    throw new Error("useModalContext must be used within a ModalContext.Provider");
  }

  return context;
}

function Modal<T = unknown>({ isOpen, onClose, state, icon, children, canDismiss = true, ...props }: ModalProps<T>) {
  const tokens = useTokens("Modal", props.tokens);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onDismiss = canDismiss ? onClose : () => {};

  let content = children;
  if (isOpen && typeof children === "function") {
    if (state) {
      content = children(state);
    } else {
      throw new Error("State can't be null.");
    }
  }

  const modalContext = React.useMemo(() => ({ onClose }), [onClose]);

  const baseClassName = cx(tokens.Container.base.master, tokens.Container.base.padding);

  const contentContainerClassName = cx(
    tokens.Container.Content.container.master,
    tokens.Container.Content.container.backgroundColor,
    tokens.Container.Content.container.borderRadius,
    tokens.Container.Content.container.padding,
    tokens.Container.Content.container.boxShadow,
  );

  const overlayInnerClassName = cx(
    tokens.Container.Overlay.inner.master,
    tokens.Container.Overlay.inner.backgroundColor,
  );

  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
      <ModalContext.Provider value={modalContext}>
        <div className={baseClassName}>
          <div className={tokens.Container.Overlay.outer}>
            <div className={overlayInnerClassName}>&nbsp;</div>
          </div>

          <DialogContent className={contentContainerClassName}>
            {canDismiss && (
              <div className={tokens.Container.Content.dismiss}>
                <ModalDismiss />
              </div>
            )}
            <div className={tokens.Container.Content.outer}>
              {icon}
              <div className={tokens.Container.Content.inner}>
                <>{content}</>
              </div>
            </div>
          </DialogContent>
        </div>
      </ModalContext.Provider>
    </DialogOverlay>
  );
}

function ModalDismiss({ ariaLabel = "Close", dismissIcon, ...props }: ModalDismissProps) {
  const tokens = useTokens("Modal", props.tokens);
  const { onClose } = useModalContext();

  const dismissButtonClassName = cx(
    tokens.Dismiss.button.master,
    tokens.Dismiss.button.color,
    tokens.Dismiss.button.hover,
  );

  const finalDismissIcon = useIcon("dismiss", dismissIcon);

  return (
    <button onClick={onClose} type="button" className={dismissButtonClassName} aria-label={ariaLabel}>
      {finalDismissIcon}
    </button>
  );
}

function ModalContent({ title, children, ...props }: ModalContentProps) {
  const tokens = useTokens("Modal", props.tokens);

  const contentTitleClassName = cx(
    tokens.Content.title.fontSize,
    tokens.Content.title.lineHeight,
    tokens.Content.title.fontWeight,
    tokens.Content.title.color,
  );

  return (
    <>
      <h3 className={contentTitleClassName} id="modal-headline">
        {title}
      </h3>
      <div className={tokens.Content.master}>{children}</div>
    </>
  );
}

function ModalFooter({ children, ...props }: ModalFooterProps) {
  const tokens = useTokens("Modal", props.tokens);

  return <div className={tokens.Footer.base}>{React.Children.map(children, (child, index) => child)}</div>;
}

function ModalIcon({ className, icon, ...props }: ModalIconProps) {
  const tokens = useTokens("Modal", props.tokens);
  const containerClassName = cx(tokens.Icon.base, tokens.Icon.backgroundColor, className);

  return <div className={containerClassName}>{icon}</div>;
}

Modal.Content = ModalContent;
Modal.Dismiss = ModalDismiss;
Modal.Footer = ModalFooter;
Modal.Icon = ModalIcon;
export default Modal;
