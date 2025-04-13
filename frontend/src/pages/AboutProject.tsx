
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate, useParams, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { BookOpen, Activity, Database, Layers } from 'lucide-react';
import FlowDiagramPage from './aboutProject/FlowDiagramPage';
import ArchitecturePage from './aboutProject/ArchitecturePage';
import DataCollectionPage from './aboutProject/DataCollectionPage';
import ModelBuildingPage from './aboutProject/ModelBuildingPage';

// This component renders inside the routes for the pages
const AboutProjectContent = () => {
  const { subpage } = useParams<{ subpage: string }>();
  const navigate = useNavigate();
  
  // Define available subpages
  const subpages = [
    { id: 'flow-diagram', name: 'Flow Diagram', icon: <Activity className="w-4 h-4 mr-2" /> },
    { id: 'architecture', name: 'Architecture', icon: <Layers className="w-4 h-4 mr-2" /> },
    { id: 'data-collection', name: 'Data Collection', icon: <Database className="w-4 h-4 mr-2" /> },
    { id: 'model-building', name: 'Model Building', icon: <BookOpen className="w-4 h-4 mr-2" /> }
  ];
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold text-kubernetes-purple mb-6">About the Project</h1>
      
      <Tabs 
        defaultValue={subpage || 'flow-diagram'} 
        className="w-full" 
        onValueChange={(value) => navigate(`/about/${value}`)}
      >
        <TabsList className="w-full mb-6 flex overflow-x-auto">
          {subpages.map(page => (
            <TabsTrigger 
              key={page.id} 
              value={page.id}
              className="flex items-center"
            >
              {page.icon}
              {page.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm min-h-[400px]">
          <Routes>
            <Route path="flow-diagram" element={<FlowDiagramPage />} />
            <Route path="architecture" element={<ArchitecturePage />} />
            <Route path="data-collection" element={<DataCollectionPage />} />
            <Route path="model-building" element={<ModelBuildingPage />} />
            <Route path="/" element={<Navigate replace to="flow-diagram" />} />
          </Routes>
        </div>
      </Tabs>
    </div>
  );
};

// This is the main container component that will be used in App.tsx
const AboutProject = () => {
  return (
    <DashboardLayout>
      <AboutProjectContent />
    </DashboardLayout>
  );
};

export default AboutProject;
