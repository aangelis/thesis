export default function Table({
  // theadData,
  data,
}: {
  // theadData: any;
  data: any[];
}) {
  const getHeadings = () => {
    return Object.keys(data[0]);
  }
  const theadData = getHeadings();
  return (
    <table>
    <thead>
      <tr>
      {theadData.map(heading => {
        return <th key={heading}>{heading}</th>
      })}
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => {
          return <tr key={index}>
              {theadData.map((key, index) => {
                    return <td key={row[key]}>{row[key]}</td>
              })}
      </tr>;
      })}
    </tbody>
  </table>
  )}