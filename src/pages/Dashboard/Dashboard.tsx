import { InputField } from "../../components/InputFields/InputFields";
import { CustomSelect } from "../../components/InputFields/CustomSelect";

const Dashboard = () => {

  return (
    <div style={{ margin: "20px" }} >
      <InputField label="Complaint By" placeHolder="Enter complainant's name" type="text" />
      <InputField label="Date" placeHolder="Select date" type="date" />
      <CustomSelect
        label="Choose Status"
        placeholder="Select status"
        options={["Pending", "Solved", "In Progress", "Closed"]}
        onChange={(val) => console.log("Selected:", val)}
      />
    </div>
  )
}

export default Dashboard;