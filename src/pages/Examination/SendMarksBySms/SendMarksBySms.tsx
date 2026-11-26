import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useSendMarksSms } from "../../../hooks/useExamination";

const SendMarksBySms: React.FC = () => {
  const [exam, setExam] = useState("1");
  const [selectedClass, setSelectedClass] = useState("5");
  const [receiver, setReceiver] = useState<string>("parents");
  const [customMessage, setCustomMessage] = useState("Dear Parent, your child's exam report is ready.");

  const { data: studentClasses } = useFetchAllStudentClasses();
  const sendMarksSmsMutation = useSendMarksSms();

  const classOptions = useMemo(() => {
    const raw = Array.isArray(studentClasses?.data) ? studentClasses.data : Array.isArray(studentClasses) ? studentClasses : [];
    if (raw.length === 0) {
      return [
        { label: "Class 5", value: "5" },
        { label: "Class 6", value: "6" },
        { label: "Class 7", value: "7" },
        { label: "Class 8", value: "8" },
      ];
    }
    return raw.map((c: any) => ({ label: c.name || `Class ${c.id}`, value: String(c.id) }));
  }, [studentClasses]);

  const handleReset = () => {
    setExam("1");
    setSelectedClass("5");
    setReceiver("parents");
    setCustomMessage("Dear Parent, your child's exam report is ready.");
    toast.info("Form reset");
  };

  const handleSendSms = async () => {
    if (!receiver) {
      toast.error("Please select a receiver");
      return;
    }

    try {
      await sendMarksSmsMutation.mutateAsync({
        exam_id: Number(exam) || 1,
        class_id: Number(selectedClass) || 5,
        receiver: receiver.toLowerCase(),
        custom_message: customMessage.trim() || undefined,
      });
      toast.success(`Marks SMS dispatched to ${receiver} successfully!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send marks SMS");
    }
  };

  return (
    <div className="page_wrapper">
      <div className="send_marks_sms_page">
        <TableWrapper
          title="Send Marks By SMS"
          isAddButton={false}
        >
          <div className="search_screen">
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    label="Exam"
                    options={[
                      { label: "First Term", value: "1" },
                      { label: "Second Term", value: "2" },
                      { label: "Third Term", value: "3" },
                    ]}
                    value={exam}
                    onChange={(val: any) => setExam(val)}
                  />

                  <CustomSelect
                    label="Class"
                    options={classOptions}
                    value={selectedClass}
                    onChange={(val: any) => setSelectedClass(val)}
                  />

                  <CustomSelect
                    label="Receiver"
                    placeholder="Select receiver"
                    options={[
                      { label: "Students", value: "students" },
                      { label: "Parents", value: "parents" },
                      { label: "All (Students & Parents)", value: "all" },
                    ]}
                    value={receiver}
                    onChange={(val: any) => setReceiver(val)}
                  />
                </div>

                <div className="body_section">
                  <InputField
                    type="text"
                    label="Custom Message"
                    placeHolder="Enter custom notification message"
                    value={customMessage}
                    onChange={(e: any) => setCustomMessage(e?.target?.value || e)}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Reset" onClick={handleReset} />
                <PrimaryButton
                  title={sendMarksSmsMutation.isPending ? "Sending..." : "Send Marks VIA SMS"}
                  icon={<Send size={16} />}
                  onClick={handleSendSms}
                  disabled={sendMarksSmsMutation.isPending}
                />
              </div>
            </div>
          </div>
        </TableWrapper>
      </div>
    </div>
  );
};

export default SendMarksBySms;
