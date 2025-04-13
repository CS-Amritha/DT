
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ModelBuildingPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Building</CardTitle>
          <CardDescription>
            Techniques and approaches used for analytics and prediction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p>
              Our model building process integrates machine learning techniques with domain knowledge
              to create predictive models for Kubernetes optimization and anomaly detection.
            </p>
            
            <h3 className="text-lg font-medium">Model Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-kubernetes-purple/20 p-4 rounded-lg">
                <h4 className="font-medium text-kubernetes-purple mb-2">Resource Prediction</h4>
                <p className="text-sm">
                  Models that predict resource usage patterns to optimize scaling and allocation.
                </p>
              </div>
              <div className="border border-kubernetes-purple/20 p-4 rounded-lg">
                <h4 className="font-medium text-kubernetes-purple mb-2">Anomaly Detection</h4>
                <p className="text-sm">
                  Models that identify unusual behavior patterns that might indicate problems.
                </p>
              </div>
              <div className="border border-kubernetes-purple/20 p-4 rounded-lg">
                <h4 className="font-medium text-kubernetes-purple mb-2">Performance Optimization</h4>
                <p className="text-sm">
                  Models that suggest configuration changes to improve overall cluster performance.
                </p>
              </div>
              <div className="border border-kubernetes-purple/20 p-4 rounded-lg">
                <h4 className="font-medium text-kubernetes-purple mb-2">Failure Prediction</h4>
                <p className="text-sm">
                  Models that forecast potential component failures before they occur.
                </p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium">Development Methodology</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Data exploration and feature engineering</li>
              <li>Model selection and hyperparameter tuning</li>
              <li>Cross-validation and testing</li>
              <li>Deployment pipeline integration</li>
              <li>Continuous retraining and validation</li>
            </ol>
            
            <h3 className="text-lg font-medium">Technologies Used</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">TensorFlow</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">PyTorch</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">scikit-learn</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Kubernetes Metrics API</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Prometheus</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Kubeflow</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelBuildingPage;
