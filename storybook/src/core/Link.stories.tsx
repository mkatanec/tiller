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

import { BrowserRouter } from "react-router-dom";

import { action } from "@storybook/addon-actions";
import { withDesign } from "storybook-addon-designs";

import { Link } from "@tiller-ds/core";

import mdx from "./Link.mdx";

export default {
  title: "Component Library/Core/Link",
  component: Link,
  parameters: {
    docs: {
      page: mdx,
    },
    decorators: [withDesign],
  },
};

export const DefaultColor = () => (
  <BrowserRouter>
    <Link to="/dashboard" onClick={action("onClick")}>
      Default
    </Link>
  </BrowserRouter>
);

export const PrimaryColor = () => (
  <BrowserRouter>
    <Link to="/dashboard" variant="primary" onClick={action("onClick")}>
      Primary
    </Link>
  </BrowserRouter>
);

export const SecondaryColor = () => (
  <BrowserRouter>
    <Link to="/dashboard" variant="secondary" onClick={action("onClick")}>
      Secondary
    </Link>
  </BrowserRouter>
);

export const TertiaryColor = () => (
  <BrowserRouter>
    <Link to="/dashboard" variant="tertiary" onClick={action("onClick")}>
      Tertiary
    </Link>
  </BrowserRouter>
);
