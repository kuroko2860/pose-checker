const StatusDisplay = ({ status, rules, referenceStatus }) => {
  return (
    <div className="text-center space-y-2">
      <div
        className={`text-lg font-semibold ${
          status.includes("✅")
            ? "text-green-400"
            : status.includes("❌")
            ? "text-red-400"
            : "text-yellow-400"
        }`}
      >
        {status}
      </div>

      {rules && <div className="text-red-400 text-sm max-w-2xl">{rules}</div>}

      <div
        className={`text-sm ${
          referenceStatus.includes("✅")
            ? "text-green-400"
            : referenceStatus.includes("❌")
            ? "text-red-400"
            : "text-gray-400"
        }`}
      >
        {referenceStatus}
      </div>
    </div>
  );
};

export default StatusDisplay;
