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

import useMaskedInput from "@viewstools/use-masked-input";

import { convertMaskToPlaceholder } from "./convertMaskToPlaceholder";
import Input, { InputProps } from "./Input";

export type MaskedInputProps = {
  /**
   * When true, adding or deleting characters won't affect the position of other characters.
   */
  keepCharPositions?: boolean;

  /**
   * The desired mask shown in the field component (string or Regex expressions).
   */
  mask: (string | RegExp)[];

  /**
   * The accessor value for the input field component (for validation, fetching, etc.).
   */
  name: string;

  /**
   * Turns this field into a required field in the form. Only applies visual representation (* next to label),
   * still requires validation on frontend or backend to accompany this value if set to true.
   */
  required?: boolean;

  /**
   * Show or hide the desired mask for input values.
   */
  showMask?: boolean;
} & Omit<InputProps, "type">;

export default function MaskedInput({
  name,
  disabled,
  placeholder,
  onChange,
  onBlur,
  mask,
  showMask = true,
  keepCharPositions = false,
  ...props
}: MaskedInputProps) {
  const id = `masked-input-${name}`;
  const currentRef = React.useRef(null);
  const inputPlaceholder = placeholder ? placeholder : showMask ? convertMaskToPlaceholder(mask) : placeholder;

  const onMaskChange = useMaskedInput({
    input: currentRef,
    mask: mask,
    onChange: onChange,
    keepCharPositions: keepCharPositions,
    value: props.value,
  });

  return (
    <Input
      inputRef={currentRef}
      name={name}
      id={id}
      data-testid={id}
      disabled={disabled}
      onChange={onMaskChange}
      placeholder={inputPlaceholder}
      onBlur={onBlur}
      {...props}
    />
  );
}
