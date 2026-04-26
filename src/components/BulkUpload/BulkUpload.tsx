import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import { CustomSelect } from "../InputFields/CustomSelect"
import InputFiles from "../InputFields/InputFiles";
import "./BulkUpload.scss"


const BulkUpload = () => {

    const genderOptions = [{ name: "Male", id: "Male" }, { name: "Female", id: "Female" }, { name: "Other", id: "Other" }]?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    return (
        <>
            <>
                <div className="body_section" >
                    <CustomSelect value={"formData?.section_id"} name="staff_id" label="Academic Year" placeholder="Select section" options={genderOptions || []} onChange={(value) => console.log("first", value)} />
                    <CustomSelect value={"formData?.class_id"} label="Class" placeholder="Select class" options={genderOptions || []} onChange={(value) => console.log("first", value)} />
                    <CustomSelect value={"formData?.section_id"} name="section_id" label="Section" placeholder="Select section" options={genderOptions || []} onChange={(value) => console.log("first", value)} />
                </div>

                <div className="body_section" >
                    <InputFiles name="bulk_students" />
                </div>

            </>

            {/* compare table */}
            <>
            </>

            {/* compare table */}
            <>
            </>

            <div className="buttons">
                <SecondaryButton />
                <PrimaryButton title="Save" />
                {/* // next // next and // save */}
            </div>
        </>
    )
}

export default BulkUpload