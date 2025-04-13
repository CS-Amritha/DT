
import React from 'react';
import TeamMember from '../components/TeamMember';

// Import sample images - these would be replaced with actual team photos
const placeholderImages = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80', 
  'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80'
];

// Sample team data
const teamMembers = [
  {
    name: "Alex Johnson",
    role: "Lead Developer",
    image: placeholderImages[0],
    email: "alex@devtrails.com",
    linkedin: "https://linkedin.com/in/alexjohnson",
    github: "https://github.com/alexjohnson"
  },
  {
    name: "Jamie Smith",
    role: "DevOps Engineer",
    image: placeholderImages[1],
    email: "jamie@devtrails.com",
    linkedin: "https://linkedin.com/in/jamiesmith",
    github: "https://github.com/jamiesmith"
  },
  {
    name: "Morgan Lee",
    role: "Frontend Developer",
    image: placeholderImages[2],
    email: "morgan@devtrails.com",
    linkedin: "https://linkedin.com/in/morganlee",
    github: "https://github.com/morganlee"
  },
  {
    name: "Taylor Rivera",
    role: "Backend Developer",
    image: placeholderImages[3],
    email: "taylor@devtrails.com",
    linkedin: "https://linkedin.com/in/taylorrivera",
    github: "https://github.com/taylorrivera"
  },
  {
    name: "Riley Chen",
    role: "UI/UX Designer",
    image: placeholderImages[4],
    email: "riley@devtrails.com",
    linkedin: "https://linkedin.com/in/rileychen",
    github: "https://github.com/rileychen"
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
