const ArchitecturePage = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">System Architecture</h2>
      <img 
        src="/image/architecture.png" 
        alt="System Architecture Diagram"
        className="max-w-full h-auto"
      />

      <div className="text-gray-700 space-y-2 mt-6">
        <p>
          This architecture shows how Kubernetes cluster health is monitored, analyzed, and explained to users using a trained model and a UI dashboard.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>K8s Cluster</strong>: Runs workloads across nodes, with metrics collected by Prometheus.</li>
          <li><strong>LitmusChaos</strong>: Injects faults to simulate real-world failures.</li>
          <li><strong>Kubeboom Listener & Predictor</strong>: Uses an MLP model to predict health from the metrics.</li>
          <li><strong>Kubeboom FastAPI</strong>: Exposes endpoints to get data, explanations, and apply remediations.</li>
          <li><strong>MongoDB</strong>: Stores predicted metrics for reference and analysis.</li>
          <li><strong>Gemini</strong>: Provides explanations and remediation suggestions based on prompts.</li>
          <li><strong>Kubeboom UI</strong>: A dashboard where users interact with data, see predictions, and trigger actions.</li>
        </ul>
      </div>
    </div>
  );
};

export default ArchitecturePage;
