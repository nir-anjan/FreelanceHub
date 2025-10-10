import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";

interface FreelancerCardProps {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  skills: string[];
  category: string;
}

const FreelancerCard = ({
  id,
  name,
  title,
  avatar,
  rating,
  reviewCount,
  hourlyRate,
  location,
  skills,
  category,
}: FreelancerCardProps) => {
  return (
    <Card className="hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="space-y-2 w-full">
            <h3 className="font-semibold text-xl text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{title}</p>
            
            <div className="flex items-center justify-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>

            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>

          <div className="w-full">
            <Badge variant="secondary" className="mb-2">
              {category}
            </Badge>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="w-full pt-4 border-t space-y-3">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">${hourlyRate}</span>
              <span className="text-sm text-muted-foreground">/hr</span>
            </div>
            <Button asChild className="w-full">
              <Link to={`/freelancers/${id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreelancerCard;
