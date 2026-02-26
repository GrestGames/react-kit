import ShowCase from '../showcase/ShowCase';

import TextInputBasic from '../examples/inputs/TextInputBasic';
import textInputBasicSource from '../examples/inputs/TextInputBasic.tsx?raw';

import NumberInputBasic from '../examples/inputs/NumberInputBasic';
import numberInputBasicSource from '../examples/inputs/NumberInputBasic.tsx?raw';

import DateInputBasic from '../examples/inputs/DateInputBasic';
import dateInputBasicSource from '../examples/inputs/DateInputBasic.tsx?raw';

import SelectBasic from '../examples/inputs/SelectBasic';
import selectBasicSource from '../examples/inputs/SelectBasic.tsx?raw';

import CheckboxBasic from '../examples/inputs/CheckboxBasic';
import checkboxBasicSource from '../examples/inputs/CheckboxBasic.tsx?raw';

import ToggleBasic from '../examples/inputs/ToggleBasic';
import toggleBasicSource from '../examples/inputs/ToggleBasic.tsx?raw';

import ButtonVariants from '../examples/inputs/ButtonVariants';
import buttonVariantsSource from '../examples/inputs/ButtonVariants.tsx?raw';

import FileUploadBasic from '../examples/inputs/FileUploadBasic';
import fileUploadBasicSource from '../examples/inputs/FileUploadBasic.tsx?raw';

import InlineEditBasic from '../examples/inputs/InlineEditBasic';
import inlineEditBasicSource from '../examples/inputs/InlineEditBasic.tsx?raw';

export default function InputsPage() {
  return (
    <>
      <h1 className="pageTitle">Inputs</h1>

      <ShowCase title="TextInput, TextArea, EmailInput, PhoneInput, PasswordInput" source={textInputBasicSource}>
        <TextInputBasic />
      </ShowCase>

      <ShowCase title="IntegerInput, DecimalInput, Positive variants, InputRange" source={numberInputBasicSource}>
        <NumberInputBasic />
      </ShowCase>

      <ShowCase title="DateInput, YearMonthSelect" source={dateInputBasicSource}>
        <DateInputBasic />
      </ShowCase>

      <ShowCase title="Select, RadioSelect, AutoComplete" source={selectBasicSource}>
        <SelectBasic />
      </ShowCase>

      <ShowCase title="Checkbox, Checkbox01, CheckboxGroup" source={checkboxBasicSource}>
        <CheckboxBasic />
      </ShowCase>

      <ShowCase title="Toggle, Toggle01" source={toggleBasicSource}>
        <ToggleBasic />
      </ShowCase>

      <ShowCase title="Button, DangerButton, WarningButton, SecondaryButton, AddNewButton" source={buttonVariantsSource}>
        <ButtonVariants />
      </ShowCase>

      <ShowCase title="FileUpload, FileMultiUpload" source={fileUploadBasicSource}>
        <FileUploadBasic />
      </ShowCase>

      <ShowCase title="Inline Edit (TextInput, IntegerInput, Select)" source={inlineEditBasicSource}>
        <InlineEditBasic />
      </ShowCase>
    </>
  );
}
