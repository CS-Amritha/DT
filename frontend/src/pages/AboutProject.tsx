import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Activity, Database, Layers } from 'lucide-react';
import ArchitecturePage from './aboutProject/ArchitecturePage';
import DataCollectionPage from './aboutProject/DataCollectionPage';

const AboutProjectContent = () => {
  const { subpage } = useParams<{ subpage: string }>();
  const navigate = useNavigate();

  const subpages = [
    { id: 'architecture', name: 'Architecture', icon: <Layers className="w-4 h-4 mr-2" /> },
    { id: 'data-collection', name: 'Data Collection', icon: <Database className="w-4 h-4 mr-2" /> },
  ];

  const renderContent = () => {
    switch (subpage) {
      case 'architecture':
        return <ArchitecturePage />;
      case 'data-collection':
        return <DataCollectionPage />;
      default:
        return <ArchitecturePage />; // fallback/default
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold text-kubernetes-purple mb-6">About the Project</h1>

      <Tabs
        defaultValue={subpage || 'flow-diagram'}
        className="w-full"
        onValueChange={(value) => navigate(`/about-project/${value}`)}

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
          {renderContent()}
        </div>
      </Tabs>
    </div>
  );
};

export default AboutProjectContent;
