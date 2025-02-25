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

import * as dateFns from "date-fns";

import { useDatepicker, START_DATE, OnDatesChangeProps } from "@datepicker-react/hooks";
import Popover, { positionMatchWidth, positionRight } from "@reach/popover";

import { IconButton } from "@tiller-ds/core";
import { InputProps, MaskedInput } from "@tiller-ds/form-elements";
import { useIntlContext } from "@tiller-ds/intl";
import { ComponentTokens, cx, TokenProps, useIcon, useTokens } from "@tiller-ds/theme";

import DatePicker from "./DatePicker";
import { usePickerOpener } from "./usePickerOpener";
import { checkDatesInterval, formatDate, getDateFormatByLang, getMaskFromFormat } from "./utils";

export type DateInputProps = {
  /**
   * Allows the clear button (x) to be shown when a value is present in the field.
   * On by default.
   */
  allowClear?: boolean;

  /**
   * Custom class name for the container.
   */
  className?: string;

  /**
   * Enables automatic closing of the popover once a date is manually typed in.
   * Off by default.
   */
  closeAfterEntry?: boolean;

  /**
   * Enables or disables the component's functionality.
   */
  disabled?: boolean;

  /**
   * The format of the date mask. E.g. 'yyyy-MM-dd' or 'dd/MM/yyyy'.
   */
  dateFormat?: string;

  /**
   * When enabled, the date mask changes on (un)focusing of the input element.
   *
   * When the input element is focused, the date mask is shown.
   *
   * When the input element is unfocused, the mask is shortened to exclude the placeholder characters.
   *
   * **ON** by default.
   */
  dynamicMask?: boolean;

  /**
   * Value passed through from validation indicating to display the error on the component.
   */
  error?: React.ReactNode;

  /**
   * If true, the popover for choosing a date is set to always have the same optimal width (370px),
   * meaning it won't stretch with the field component. Only applies to desktop displays.
   *
   * On by default.
   */
  fixedPopoverWidth?: boolean;

  /**
   * The help text displayed below the date input field.
   */
  help?: React.ReactNode;

  /**
   * If true, the current date is highlighted in the date picker for easier navigation.
   *
   * Off by default.
   */
  highlightToday?: boolean;

  /**
   * Represents the label above the date input field.
   */
  label?: React.ReactNode;

  /**
   * Maximum possible date enabled for selection.
   */
  maxDate?: Date;

  /**
   * Minimum possible date enabled for selection.
   */
  minDate?: Date;

  /**
   * The accessor value for the input field component (for validation, fetching, etc.).
   */
  name: string;

  /**
   * Defines the behaviour of the component once the focus shifts away from the component.
   */
  onBlur?: () => void;

  /**
   * Function that handles the behaviour of the component once its state changes.
   */
  onChange: (value: Date | null) => void;

  /**
   * The placeholder displayed inside the date input field.
   */
  placeholder?: string;

  /**
   * Position of the popover for choosing the date range. Convenient for situations where the
   * popover would pass through the end of the screen on a certain position.
   * If set to 'left', the popover starts from the left side of the components and stretches to the right.
   * If set to 'right', the popover starts from the right side of the components and stretches to the left.
   * Defaults to 'left'.
   */
  popoverPosition?: "left" | "right";

  /**
   * Turns this field into a required field in the form. Only applies visual representation (* next to label),
   * still requires validation on frontend or backend to accompany this value if set to true.
   */
  required?: boolean;

  /**
   * Show or hide the desired mask for date value when no value is present in the field.
   */
  showMaskOnEmpty?: boolean;

  /**
   * The value of the field sent on submit and/or retrieved on component render (Date type).
   */
  value: Date | null;
} & Omit<InputProps, "onBlur" | "onChange" | "value"> &
  Omit<Intl.DateTimeFormatOptions, "localeMatcher" | "weekday" | "year" | "month" | "day"> &
  DateInputTokensProps;

type DateInputTokensProps = {
  tokens?: ComponentTokens<"DateInput">;
};

type DateInputInputProps = {
  dateIcon?: React.ReactElement;

  focusedDate: Date | null;

  inputRef: React.RefObject<HTMLInputElement>;

  mask?: (string | RegExp)[];

  onChange: (value: string) => void;

  onClick: () => void;

  value: string;
} & Omit<DateInputProps, "onChange" | "value" | "inputRef"> &
  TokenProps<"DateInput">;

export default function DateInput({
  allowClear = true,
  className,
  value,
  minDate,
  maxDate,
  onBlur,
  fixedPopoverWidth = true,
  popoverPosition = "left",
  closeAfterEntry,
  dateFormat,
  highlightToday,
  ...props
}: DateInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const datePickerRef = React.useRef<HTMLDivElement>(null);
  const lang = useIntlContext()?.lang || "en";

  const finalDateFormat = dateFormat?.replace(/m/g, "M") || getDateFormatByLang(lang);
  const formattedValue = value ? dateFns.format(value, finalDateFormat) : "";
  const [typedValue, setTypedValue] = React.useState<string>(formattedValue);

  const onDatesChange = (data: OnDatesChangeProps) => {
    props.onChange(data.startDate);
    setTypedValue(dateFns.format(data.startDate as Date, finalDateFormat));
    setOpened(false);
  };

  const datePicker = useDatepicker({
    initialVisibleMonth: value || minDate || new Date(),
    startDate: value || null,
    endDate: null,
    focusedInput: START_DATE,
    minBookingDate: minDate,
    maxBookingDate: maxDate,
    numberOfMonths: 1,
    onDatesChange,
  });
  const { opened, setOpened } = usePickerOpener(false, inputRef, datePickerRef, undefined);

  const checkActiveMonthsValidity =
    value &&
    datePicker.activeMonths[0].month === value.getMonth() &&
    datePicker.activeMonths[0].year === value.getFullYear();

  const onOpen = () => {
    if (props.disabled || props.readOnly) {
      return;
    }
    if (!checkActiveMonthsValidity && value) {
      datePicker.onDateFocus(value || minDate || (null as unknown as Date));
    }
    setOpened(true);
    inputRef.current?.focus();
  };

  const onChange = (value: string) => {
    const dateValue = formatDate(value, finalDateFormat);
    if (!dateValue || checkDatesInterval(dateValue, minDate, maxDate, lang)) {
      if (dateValue) {
        if (closeAfterEntry) {
          setOpened(false);
        }
        props.onChange(dateValue);
        datePicker.onDateFocus(formatDate(value, finalDateFormat) as Date);
      } else {
        props.onChange(null);
        setTypedValue(value);
      }
    }
  };

  const onReset = () => {
    if (props.onReset) {
      props.onReset();
    }
    inputRef.current?.focus();
    setTypedValue("");
    setOpened(false);
  };

  return (
    <div className={className}>
      <DateInputInput
        {...props}
        inputRef={inputRef}
        onClick={onOpen}
        onFocus={onOpen}
        focusedDate={value || null}
        allowClear={allowClear}
        onBlur={onBlur}
        value={formattedValue || typedValue}
        onChange={onChange}
        onReset={onReset}
        mask={getMaskFromFormat(typedValue, finalDateFormat)}
        dateFormat={dateFormat}
        tokens={{ textColor: !value ? "text-body-light" : undefined }}
      />
      <Popover
        className="z-50"
        targetRef={inputRef}
        position={popoverPosition === "left" ? positionMatchWidth : positionRight}
      >
        {opened && (
          <DatePicker
            datePicker={datePicker}
            datePickerRef={datePickerRef}
            focusedDate={value || null}
            minYear={minDate?.getFullYear()}
            maxYear={maxDate?.getFullYear()}
            isDateRange={false}
            fixedWidth={fixedPopoverWidth}
            highlightToday={highlightToday}
          />
        )}
      </Popover>
    </div>
  );
}

function DateInputInput({
  onClick,
  onChange,
  focusedDate,
  required,
  allowClear = true,
  dateIcon,
  mask,
  value,
  inputRef,
  dynamicMask = true,
  showMaskOnEmpty,
  dateFormat,
  ...props
}: DateInputInputProps) {
  const lang = useIntlContext()?.lang || "en";

  const tokens = useTokens("DateInput", props.tokens);

  const dateIconClassName = cx({ [tokens.DatePicker.range.iconColor]: !(props.disabled || props.readOnly) });
  const finalDateIcon = useIcon("date", dateIcon, { className: dateIconClassName });

  const getPlaceholder = () => {
    if (props.placeholder !== undefined) {
      return props.placeholder;
    }
    if (dateFormat) {
      return dateFormat;
    }
    if (showMaskOnEmpty) {
      return undefined;
    }
    return getDateFormatByLang(lang).toLowerCase();
  };

  return (
    <MaskedInput
      {...props}
      value={value}
      inputRef={inputRef}
      mask={mask as (string | RegExp)[]}
      dynamic={dynamicMask}
      showMask={showMaskOnEmpty}
      keepCharPositions={true}
      placeholder={getPlaceholder()}
      name={props.name}
      onClick={onClick}
      onBlur={props.onBlur}
      onChange={(e) => onChange(e.target.value)}
      onReset={props.onReset}
      allowClear={allowClear}
      required={required}
      inlineTrailingIcon={
        <IconButton
          disabled={props.disabled || props.readOnly}
          icon={finalDateIcon}
          onClick={onClick}
          showTooltip={false}
        />
      }
      autoComplete="off"
    />
  );
}
