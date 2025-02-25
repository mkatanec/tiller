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

import { withDesign } from "storybook-addon-designs";

import { DateRangeInputField } from "@tiller-ds/formik-elements";
import { beautifySource, FormikDecorator } from "../utils";
import { Tooltip } from "@tiller-ds/core";
import { Icon } from "@tiller-ds/icons";
import { Intl } from "@tiller-ds/intl";

import storybookDictionary from "../intl/storybookDictionary";

import mdx from "./DateRangeInputField.mdx";

const translations = storybookDictionary.translations;
const start = "start";
const end = "end";
const startWithValue = "startDateWithValue";
const startWithDateValue = "startDateWithDateValue";
const startWithError = "startDateWithError";
const endWithValue = "endDateWithValue";
const endWithDateValue = "endDateWithDateValue";
const endWithError = "endDateWithError";

const initialValues = {
  [startWithValue]: "2020-10-05",
  [startWithDateValue]: new Date(),
  [endWithValue]: "2020-10-10",
  [endWithDateValue]: new Date("2025-01-01"),
};

const initialErrors = {
  [startWithError]: "start test error",
  [endWithError]: "end test error",
};

const initialTouched = {
  [startWithError]: true,
  [endWithError]: true,
};

export default {
  title: "Component Library/Formik-elements/DateRangeInputField",
  component: DateRangeInputField,
  parameters: {
    docs: {
      page: mdx,
      source: { type: "auto", excludeDecorators: true },
      transformSource: (source) => beautifySource(source),
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/nhiVbURxzFkse4bGiDFuya/Tiller?node-id=8780%3A11403",
    },
  },
  decorators: [
    // eslint-disable-next-line react/display-name
    (storyFn: () => React.ReactNode) => (
      <FormikDecorator initialValues={initialValues} initialErrors={initialErrors} initialTouched={initialTouched}>
        {storyFn()}
      </FormikDecorator>
    ),
    withDesign,
  ],
};

export const WithLabel = () => <DateRangeInputField start={start} end={end} label={<Intl name="label" />} />;

export const WithoutLabel = () => <DateRangeInputField start={start} end={end} />;

export const WithValue = () => {
  // incl-code
  // initial values passed as initialValues prop of Formik
  const initialValues = {
    [startWithValue]: "2020-10-05",
    [endWithValue]: "2020-10-10",
  };
  return <DateRangeInputField start={startWithValue} end={endWithValue} label={<Intl name="label" />} />;
};

export const WithDateValue = () => {
  // incl-code
  // initial Date values passed as initialValues prop of Formik
  const initialValues = {
    [startWithDateValue]: new Date(),
    [endWithDateValue]: new Date("2025-01-01"),
  };
  return <DateRangeInputField start={startWithDateValue} end={endWithDateValue} label={<Intl name="label" />} />;
};

export const WithoutClearButton = () => (
  <DateRangeInputField start={startWithValue} end={endWithValue} label={<Intl name="label" />} allowClear={false} />
);

export const WithStartValue = () => {
  // incl-code
  // initial value passed as initialValues prop of Formik
  const initialValues = {
    [startWithValue]: "2020-10-05",
  };
  return <DateRangeInputField start={startWithValue} end={end} label={<Intl name="label" />} />;
};

export const Disabled = () => (
  <DateRangeInputField start={start} end={end} label={<Intl name="label" />} disabled={true} />
);

export const ReadOnly = () => (
  <DateRangeInputField start={startWithValue} end={endWithValue} label={<Intl name="label" />} readOnly={true} />
);

export const WithCustomPlaceholder = (args, context) => (
  <DateRangeInputField start={start} end={end} placeholder={translations[context.globals.language]["placeholder"]} />
);

export const WithHelp = () => <DateRangeInputField start={start} end={end} help={<Intl name="help" />} />;

export const WithTooltip = () => (
  <DateRangeInputField
    start={start}
    end={end}
    tooltip={
      <Tooltip label={<Intl name="tooltip" />}>
        <Icon type="info" />
      </Tooltip>
    }
  />
);

export const WithDifferentPopoverPosition = () => (
  <DateRangeInputField start={start} end={end} label={<Intl name="label" />} popoverPosition="right" />
);

export const WithError = () => <DateRangeInputField start={startWithError} end={endWithError} />;

export const WithStartError = () => <DateRangeInputField start={startWithError} end={end} />;

export const WithEndError = () => <DateRangeInputField start={start} end={endWithError} />;

export const WithMinAndMaxDate = () => (
  <DateRangeInputField start={start} end={end} minDate={new Date("2020-10-05")} maxDate={new Date("2025-01-01")} />
);

export const WithHighlightedCurrentDate = () => (
  <DateRangeInputField start={start} end={end} label={<Intl name="label" />} highlightToday={true} />
);
