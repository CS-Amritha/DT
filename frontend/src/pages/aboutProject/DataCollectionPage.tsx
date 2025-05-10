const DataCollectionPage = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Data Collection Architecture</h2>
      <img 
        src="/image/data_collection.png" 
        alt="System Architecture Diagram"
        className="max-w-full h-auto mb-6"
      />
      <div className="text-gray-700 space-y-2">
        <p>
          This flow illustrates how data is collected and processed to train an MLP model for Kubernetes cluster health prediction.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>K8s Cluster</strong>: Two nodes running pods simulate real workloads.</li>
          <li><strong>LitmusChaos</strong>: Injects faults to simulate failures.</li>
          <li><strong>Prometheus</strong>: Monitors and captures metrics from the cluster.</li>
          <li>
            <strong>Kubeboom Backend</strong>:
            <ul className="list-disc list-inside ml-4">
              <li><em>Listener & Exporter</em> gathers data.</li>
              <li><em>Manual Labeling</em> is done via Excel.</li>
              <li><em>Model Training</em> uses labeled data to train the MLP.</li>
            </ul>
          </li>
          <li><strong>Output</strong>: A trained MLP model that predicts cluster health.</li>
        </ul>
      </div>
    </div>
  );
};

export default DataCollectionPage;
