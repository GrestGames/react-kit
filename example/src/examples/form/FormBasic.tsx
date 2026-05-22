import { useAsyncForm, Form, SubmitButton, TextInput, IntegerInput, Select, Checkbox, toast } from '@grest-ts/react';

interface Person {
  name: string;
  age: number;
  role: string;
  active: boolean;
}

const roleOptions = [
  { id: 'dev', name: 'Developer' },
  { id: 'design', name: 'Designer' },
  { id: 'pm', name: 'Product Manager' },
];

export default function FormBasic() {
  const [F, data] = useAsyncForm<Person>({
    init: { name: 'Alice', age: 28, role: 'dev', active: true },
    onSubmit: async (obj) => {
      await new Promise(r => setTimeout(r, 800));
      toast.success('Saved ' + obj.name);
    },
  }, []);

  return (
    <Form prop={F}>
      <table>
        <tbody>
          <tr>
            <td style={{ padding: '4px 12px 4px 0' }}>Name:</td>
            <td><TextInput prop={F.name} /></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 12px 4px 0' }}>Age:</td>
            <td><IntegerInput prop={F.age} /></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 12px 4px 0' }}>Role:</td>
            <td><Select prop={F.role} options={roleOptions} /></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 12px 4px 0' }}>Active:</td>
            <td><Checkbox prop={F.active} /></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 12px 4px 0' }}>Active:</td>
            <td><SubmitButton>Save Person</SubmitButton></td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
        Current data: {JSON.stringify(data)}
      </div>
    </Form>
  );
}
