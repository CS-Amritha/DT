
import React from 'react';
import TeamMember from '../components/TeamMember';

// Import sample images - these would be replaced with actual team photos
const placeholderImages = [
  'https://avatars.githubusercontent.com/u/116827842?v=4',
  'https://avatars.githubusercontent.com/u/116827111?v=4',
  'https://avatars.githubusercontent.com/u/116825964?v=4', 
  'https://avatars.githubusercontent.com/u/116829016?v=4',
  'https://avatars.githubusercontent.com/u/98827633?v=4'
];

// Sample team data
const teamMembers = [
  {
    name: "C S Amritha",
    role: "Lead Developer",
    image: placeholderImages[0],
    email: "csamritha244@gmail.com",
    linkedin: "https://www.linkedin.com/in/c-s-amritha-81b789255/",
    github: "https://github.com/CS-Amritha"
  },
  {
    name: "Anaswara Suresh M K",
    role: "Backend Developer",
    image: placeholderImages[1],
    email: "anaswarasuresh1111@gmail.com",
    linkedin: "https://www.linkedin.com/in/anaswara-suresh-m-k-475270252/",
    github: "https://github.com/Anaswara-Suresh"
  },
  {
    name: "Avi Nair",
    role: "Backend Developer",
    image: placeholderImages[2],
    email: "avijnair@gmail.com",
    linkedin: "https://www.linkedin.com/in/avi-nair-a43773256/",
    github: "https://github.com/Avi-Nair"
  },
  {
    name: "Adithya N S",
    role: "Data and AI/ML Developer",
    image: placeholderImages[3],
    email: "nsadithya004@gmail.com",
    linkedin: "https://www.linkedin.com/in/adithya-n-s-6644a8255/",
    github: "https://github.com/ADITHYA-NS"
  },
  {
    name: "R Sruthi",
    role: "UI/UX and Frontend Developer",
    image: placeholderImages[4],
    email: "sruthirs2004@gmail.com",
    linkedin: "https://www.linkedin.com/in/r-sruthi-345580255/",
    github: "https://github.com/R-Sruthi"
  }
];

const AboutUs = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-kubernetes-purple mb-2">Our Team</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Meet the talented individuals behind Kubeboom, working together to create 
          an efficient Kubernetes monitoring solution for DevTrails.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <TeamMember 
            key={index}
            name={member.name}
            role={member.role}
            image={member.image}
            email={member.email}
            linkedin={member.linkedin}
            github={member.github}
          />
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
