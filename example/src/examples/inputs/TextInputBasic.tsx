import { useState } from 'react';
import { TextInput, TextArea, EmailInput, PhoneInput, PasswordInput } from '@grest-ts/react';

export default function TextInputBasic() {
  const [text, setText] = useState<string | null>('Hello');
  const [area, setArea] = useState<string | null>('Multi-line\ntext here');
  const [email, setEmail] = useState<string | null>('user@example.com');
  const [phone, setPhone] = useState<string | null>('+1 555-1234');
  const [password, setPassword] = useState<string | null>('secret');

  return (
    <>
      <div className="demoRow">
        <label>
          TextInput
          <TextInput value={text} onChange={setText} placeholder="Enter text..." />
        </label>
        <label>
          EmailInput
          <EmailInput value={email} onChange={setEmail} placeholder="Email" />
        </label>
        <label>
          PhoneInput
          <PhoneInput value={phone} onChange={setPhone} placeholder="Phone" />
        </label>
        <label>
          PasswordInput
          <PasswordInput value={password} onChange={setPassword} placeholder="Password" />
        </label>
      </div>
      <div className="demoRow">
        <label>
          TextInput with suffix
          <TextInput value={text} onChange={setText} suffix="kg" />
        </label>
        <label>
          TextInput readOnly
          <TextInput value={text} readOnly />
        </label>
        <label>
          TextInput disabled
          <TextInput value={text} disabled />
        </label>
      </div>
      <div className="demoRow">
        <label style={{ width: 300 }}>
          TextArea
          <TextArea value={area} onChange={setArea} rows={3} />
        </label>
        <label style={{ width: 300 }}>
          TextArea autoResize
          <TextArea value={area} onChange={setArea} autoResize />
        </label>
      </div>
    </>
  );
}
