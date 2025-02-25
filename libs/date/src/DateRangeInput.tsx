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

import { useDatepicker, START_DATE, OnDatesChangeProps, FocusedInput, END_DATE } from "@datepicker-react/hooks";

import Popover, { positionMatchWidth, positionRight } from "@reach/popover";

import { IconButton } from "@tiller-ds/core";
import { InputProps, MaskedInput } from "@tiller-ds/form-elements";
import { useIntlContext } from "@tiller-ds/intl";
import { ComponentTokens, cx, TokenProps, useIcon, useTokens } from "@tiller-ds/theme";

import DatePicker from "./DatePicker";
import { checkDatesInterval, formatDate, getDateFormatByLang, getMaskFromFormat } from "./utils";

type DateTimeFormatOptionsOnly = "localeMatcher" | "weekday" | "year" | "month" | "day";

export type DateRangeInputProps = {
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
   * The format of the date mask. E.g. 'yyyy-MM-dd' or 'dd/MM/yyyy'.
   */
  dateFormat?: string;

  /**
   * Enables or disables the component's functionality.
   */
  disabled?: boolean;

  /**
   * When enabled, the date range mask changes on (un)focusing of the input element.
   *
   * When the input element is focused, the date mask is shown.
   *
   * When the input element is unfocused, the mask is shortened to exclude the placeholder characters.
   *
   * **ON** by default.
   */
  dynamicMask?: boolean;

  /**
   * Forces a set end date for the component.
   */
  end?: Date | null;

  /**
   * Value passed through from validation indicating to display the error on the component.
   */
  error?: React.ReactNode;

  /**
   * If true, the popover for choosing a date is set to always have the same optimal width (500px),
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
   * The desired mask shown in the field component (string or Regex expressions).
   */
  mask?: (string | RegExp)[];

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
  onChange: (start: Date | null, end: Date | null) => void;

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
   * Show or hide the desired mask for date range value when no value is present in the field.
   */
  showMaskOnEmpty?: boolean;

  /**
   * Forces a set start date for the component.
   */
  start?: Date | null;
} & Omit<InputProps, "onChange" | "onBlur" | "value"> &
  Omit<Intl.DateTimeFormatOptions, DateTimeFormatOptionsOnly> &
  DateInputTokensProps;

type DateInputTokensProps = {
  tokens?: ComponentTokens<"DateInput">;
};

type DateRangeInputInputProps = {
  dateIcon?: React.ReactElement;

  inputRef: React.RefObject<HTMLInputElement>;

  onChange: (start: string, end: string) => void;

  onClick: () => void;

  value: string | null;
} & Omit<DateRangeInputProps, "start" | "end" | "onChange" | "inputRef"> &
  TokenProps<"DateInput">;

type DatePickerState = {
  startDate: Date | null;
  endDate: Date | null;
  focusedInput: FocusedInput;
};

export default function DateRangeInput({
  className,
  name = "daterange",
  start,
  end,
  minDate,
  maxDate,
  fixedPopoverWidth = true,
  popoverPosition = "left",
  allowClear,
  closeAfterEntry,
  onBlur,
  dateFormat,
  highlightToday,
  ...props
}: DateRangeInputProps) {
  const lang = useIntlContext()?.lang || "en";

  const finalDateFormat = dateFormat?.replace(/m/g, "M") || getDateFormatByLang(lang);
  const formattedStart = start ? dateFns.format(start, finalDateFormat) : "";
  const formattedEnd = end ? dateFns.format(end, finalDateFormat) : "";

  const formattedValue = !formattedStart && !formattedEnd ? "" : `${formattedStart} - ${formattedEnd}`;
  const [typedValue, setTypedValue] = React.useState<string>(formattedValue);

  React.useEffect(() => {
    if (inputRef.current !== document.activeElement) {
      setTypedValue(formattedValue);
    }
  }, [formattedEnd, formattedStart, formattedValue]);

  const [datePickerState, setDatePickerState] = React.useState<DatePickerState>({
    startDate: start ?? null,
    endDate: end ?? null,
    focusedInput: start && !end ? END_DATE : START_DATE,
  });
  const [opened, setOpened] = React.useState(false);

  const onDatesChange = (data: OnDatesChangeProps) => {
    if (data.startDate && !data.endDate) {
      setDatePickerState({ startDate: data.startDate, endDate: data.endDate, focusedInput: data.focusedInput });
      props.onChange(data.startDate, data.endDate);
    } else if (data.focusedInput) {
      setDatePickerState({ startDate: data.startDate, endDate: null, focusedInput: END_DATE });
      props.onChange(data.startDate, null);
    }

    if (!data.focusedInput) {
      setDatePickerState({ startDate: null, endDate: null, focusedInput: START_DATE });
      props.onChange(data.startDate, data.endDate);
      setOpened(false);
    }
  };

  const checkEndValidity = (customStart?: Date, customEnd?: Date) => {
    customStart?.setHours(0, 0, 0, 0);
    customEnd?.setHours(0, 0, 0, 0);
    if (customStart && customEnd) {
      return customStart.getTime() <= customEnd.getTime();
    }
    if (datePickerState.startDate && datePickerState.endDate) {
      datePickerState.startDate.setHours(0, 0, 0, 0);
      datePickerState.endDate.setHours(0, 0, 0, 0);
      return datePickerState.startDate.getTime() <= datePickerState.endDate.getTime();
    }
    if (start && end) {
      return start.getTime() <= end.getTime();
    }
    return true;
  };

  const datePicker = useDatepicker({
    startDate: start ?? datePickerState.startDate,
    endDate: end ?? datePickerState.endDate,
    focusedInput: datePickerState.focusedInput,
    minBookingDate: minDate,
    maxBookingDate: maxDate,
    numberOfMonths: 2,
    onDatesChange,
  });
  const checkActiveMonthsValidity =
    start &&
    datePicker.activeMonths[0].month === start?.getMonth() &&
    datePicker.activeMonths[0].year === start?.getFullYear();

  React.useEffect(() => {
    if (start && end && !checkActiveMonthsValidity) {
      setDatePickerState({
        startDate: start,
        endDate: end,
        focusedInput: START_DATE,
      });
    } else if (start && !end) {
      setDatePickerState({ startDate: start ?? null, endDate: null, focusedInput: END_DATE });
    } else if (!start && !end) {
      setDatePickerState({ startDate: null, endDate: null, focusedInput: START_DATE });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  const onOpen = () => {
    if (props.disabled || props.readOnly) {
      return;
    }
    if (!checkActiveMonthsValidity && !datePicker.isDateFocused(start as Date)) {
      datePicker.onDateFocus(start || minDate || (null as unknown as Date));
    }
    setOpened(true);
    inputRef.current?.focus();
  };
  const inputRef = React.useRef<HTMLInputElement>(null);
  const datePickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function listener(event: MouseEvent) {
      const { relatedTarget, target } = event;

      const isOutsideInput = inputRef.current && !inputRef.current?.contains((relatedTarget || target) as Element);
      const isOutsideDatePicker =
        datePickerRef.current && !datePickerRef.current?.contains((relatedTarget || target) as Element);

      if (opened && isOutsideInput && isOutsideDatePicker) {
        setOpened(false);
      }
    }

    window.addEventListener("mousedown", listener);
    return () => {
      window.removeEventListener("mousedown", listener);
    };
  }, [onBlur, opened]);

  const onChange = (start: string, end: string) => {
    const startingDate = formatDate(start, finalDateFormat) as Date;
    const endingDate = formatDate(end, finalDateFormat) as Date;

    if (
      checkDatesInterval(startingDate, minDate, maxDate, lang) &&
      checkDatesInterval(endingDate, minDate, maxDate, lang) &&
      checkEndValidity(startingDate, endingDate)
    ) {
      if (startingDate && !endingDate) {
        datePicker.onDateFocus(startingDate);
        props.onChange(startingDate, null);
      } else if (endingDate && !startingDate) {
        props.onChange(null, endingDate);
      } else if (startingDate && endingDate) {
        if (closeAfterEntry) {
          setOpened(false);
        }
        datePicker.onDateFocus(endingDate);
        props.onChange(startingDate, endingDate);
        setDatePickerState({ startDate: startingDate, endDate: endingDate, focusedInput: START_DATE });
      } else {
        props.onChange(null, null);
      }
      setTypedValue(!start && !end ? "" : start + " - " + end);
    }
    inputRef.current?.focus();
  };

  const onReset = () => {
    if (props.onReset) {
      props.onReset();
    }
    inputRef.current?.focus();
    setTypedValue("");
    setOpened(false);
  };

  const getDateRangeMask = () => {
    const startingDate = typedValue?.split(" - ")[0] as string;
    const endingDate = typedValue?.split(" - ")[1] as string;
    const rangeAddOn = [" ", "-", " "];

    return [
      ...getMaskFromFormat(startingDate, finalDateFormat),
      ...rangeAddOn,
      ...getMaskFromFormat(endingDate, finalDateFormat),
    ];
  };

  return (
    <div className={className}>
      <DateRangeInputInput
        {...props}
        name={name}
        inputRef={inputRef}
        onClick={onOpen}
        onFocus={onOpen}
        onChange={onChange}
        onReset={onReset}
        onBlur={onBlur}
        allowClear={allowClear}
        value={typedValue}
        mask={getDateRangeMask()}
        dateFormat={dateFormat}
        tokens={{ textColor: !(formattedStart && formattedEnd) ? "text-body-light" : undefined }}
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
            focusedDate={start as Date}
            minYear={minDate?.getFullYear()}
            maxYear={maxDate?.getFullYear()}
            isDateRange={true}
            fixedWidth={fixedPopoverWidth}
            highlightToday={highlightToday}
          />
        )}
      </Popover>
    </div>
  );
}

function DateRangeInputInput({
  onClick,
  onChange,
  value,
  allowClear = true,
  mask,
  inputRef,
  dateIcon,
  dynamicMask = true,
  showMaskOnEmpty,
  dateFormat,
  ...props
}: DateRangeInputInputProps) {
  const lang = useIntlContext()?.lang || "en";

  const tokens = useTokens("DateInput", props.tokens);
  const dateIconClassName = cx({ [tokens.DatePicker.range.iconColor]: !(props.disabled || props.readOnly) });
  const finalDateIcon = useIcon("date", dateIcon, { className: dateIconClassName });

  const getPlaceholder = () => {
    if (props.placeholder !== undefined) {
      return props.placeholder;
    }
    if (dateFormat) {
      return dateFormat + " - " + dateFormat;
    }
    if (showMaskOnEmpty) {
      return undefined;
    }

    const defaultDateFormat = getDateFormatByLang(lang).toLowerCase();
    return `${defaultDateFormat} - ${defaultDateFormat}`;
  };

  return (
    <MaskedInput
      {...props}
      inputRef={inputRef}
      mask={mask as (string | RegExp)[]}
      keepCharPositions={true}
      dynamic={dynamicMask}
      showMask={showMaskOnEmpty}
      placeholder={getPlaceholder()}
      value={value ?? undefined}
      name={props.name}
      onClick={onClick}
      onChange={(e) => onChange(e.target.value.split(" - ")[0], e.target.value.split(" - ")[1])}
      onReset={props.onReset}
      allowClear={allowClear}
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
