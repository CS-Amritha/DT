
import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeamMemberProps {
  name: string;
  role: string;
  image: string;
  email?: string;
  linkedin?: string;
  github?: string;
}

const TeamMember = ({ name, role, image, email, linkedin, github }: TeamMemberProps) => {
  return (
    <div className="flex flex-col items-center p-6 bg-background rounded-xl shadow-md border border-border">
      <div className="h-40 w-40 rounded-full overflow-hidden mb-4">
        <img 
          src={image} 
          alt={`${name}, ${role}`} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <h3 className="text-xl font-semibold text-kubernetes-purple">{name}</h3>
      <p className="text-gray-500 mb-4">{role}</p>
      
      <div className="flex space-x-2 mt-2">
        {email && (
          <Button variant="outline" size="icon" asChild>
            <a href={`mailto:${email}`} title={`Email ${name}`}>
              <Mail className="h-4 w-4" />
            </a>
          </Button>
        )}
        
        {linkedin && (
          <Button variant="outline" size="icon" asChild>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" title={`${name}'s LinkedIn`}>
              <Linkedin className="h-4 w-4" />
            </a>
          </Button>
        )}
        
        {github && (
          <Button variant="outline" size="icon" asChild>
            <a href={github} target="_blank" rel="noopener noreferrer" title={`${name}'s GitHub`}>
              <Github className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TeamMember;
