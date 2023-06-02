import { useState } from "react";
import { useDispatch } from "react-redux";
import CSVLink from "../../Components/Common/CSVLink";

interface CSVLinkProps {
  id: string;
  filename: string;
  data: string;
}

export default function useExport() {
  const dispatch: any = useDispatch();
  const [isExporting, setIsExporting] = useState(false);
  const [csvLinkProps, setCsvLinkProps] = useState<CSVLinkProps>({
    id: "csv-download-link",
    filename: "",
    data: "",
  });

  const _CSVLink = () => {
    const { filename, data, id } = csvLinkProps;
    return <CSVLink id={id} filename={filename} data={data} />;
  };

  const getTimestamp = () => {
    const d = new Date();
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString();

    return date+"_"+time;
}

  const exportCSV = async (
    filenamePrefix: string,
    action: any,
    parse = (data: string) => data
  ) => {
    setIsExporting(true);

    const filename = `${filenamePrefix}_${getTimestamp()}.csv`;

    const res = await dispatch(action);
    if (res.status === 200) {
      setCsvLinkProps({ ...csvLinkProps, filename, data: parse(res.data) });
      document.getElementById(csvLinkProps.id)?.click();
    }

    setIsExporting(false);
  };

  const exportJSON = async (
    filenamePrefix: string,
    action: any,
    parse = (data: string) => data
  ) => {
    setIsExporting(true);

    const res = await dispatch(action);
    if (res.status === 200) {
      const a = document.createElement("a");
      const blob = new Blob([parse(JSON.stringify(res.data.results))], {
        type: "application/json",
      });
      a.href = URL.createObjectURL(blob);
      a.download = `${filenamePrefix}-${getTimestamp()}.json`;
      a.click();
    }

    setIsExporting(false);
  };

  const exportFile = (
    action: any,
    filePrefix = "export",
    type = "csv",
    parse = (data: string) => data
  ) => {
    if (!action) return;

    switch (type) {
      case "csv":
        exportCSV(filePrefix, action(), parse);
        break;
      case "json":
        exportJSON(filePrefix, action(), parse);
        break;
      default:
        exportCSV(filePrefix, action(), parse);
    }
  };

  return {
    isExporting,

    _CSVLink,

    exportCSV,
    exportJSON,
    exportFile,
  };
}
