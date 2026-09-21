import React from "react";
import { useFetchGeneralSettings } from "../../hooks/useGeneralSettings";
import "./Footer.scss";

const Footer: React.FC = () => {
  const { data } = useFetchGeneralSettings();
  const copyrightText =
    data?.data?.copyright_text ||
    `© ${new Date().getFullYear()} YES School. All rights reserved.`;

  return (
    <footer className="dashboard_footer">
      <p className="copyright_note">{copyrightText}</p>
    </footer>
  );
};

export default Footer;
