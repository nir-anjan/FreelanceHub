import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "@/services";
import { JobCreateRequest } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const JobForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<JobCreateRequest>({
    title: "",
    description: "",
    budget_min: undefined,
    budget_max: undefined,
    duration: "",
    category: "",
    skills: "",
    requirements: "",
    project_details: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "Web Development",
    "Mobile Development",
    "Design & Creative",
    "Writing & Translation",
    "Digital Marketing",
    "Data Science & Analytics",
    "Video & Animation",
    "Music & Audio",
    "Programming & Tech",
    "Business",
    "Other",
  ];

  const durations = [
    "Less than 1 week",
    "1-2 weeks",
    "2-4 weeks",
    "1-2 months",
    "2-6 months",
    "More than 6 months",
    "Ongoing",
  ];

  const handleInputChange = (
    field: keyof JobCreateRequest,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }

    if (formData.budget_min && formData.budget_max) {
      if (formData.budget_min > formData.budget_max) {
        newErrors.budget_min =
          "Minimum budget cannot be greater than maximum budget";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await dashboardService.createJob(formData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Job posted successfully!",
        });
        navigate("/dashboard/jobs");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Briefcase className="h-8 w-8 mr-3" />
            Post a New Job
          </h1>
          <p className="text-muted-foreground mt-2">
            Create a detailed job posting to attract the best freelancers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Build a responsive website for my business"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Provide a detailed description of your project requirements..."
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || ""}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Project Duration</Label>
                <Select
                  value={formData.duration || ""}
                  onValueChange={(value) =>
                    handleInputChange("duration", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget_min">Minimum Budget (₹)</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "budget_min",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="10000"
                  min="0"
                  className={errors.budget_min ? "border-red-500" : ""}
                />
                {errors.budget_min && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.budget_min}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="budget_max">Maximum Budget (₹)</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "budget_max",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="50000"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills and Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Skills and Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="skills">Required Skills</Label>
              <Input
                id="skills"
                value={formData.skills || ""}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                placeholder="e.g., React, Node.js, MongoDB, UI/UX Design"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate skills with commas
              </p>
            </div>

            <div>
              <Label htmlFor="requirements">Additional Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements || ""}
                onChange={(e) =>
                  handleInputChange("requirements", e.target.value)
                }
                placeholder="Any specific requirements, qualifications, or expectations..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="project_details">Project Details</Label>
              <Textarea
                id="project_details"
                value={formData.project_details || ""}
                onChange={(e) =>
                  handleInputChange("project_details", e.target.value)
                }
                placeholder="Additional project details, timeline, deliverables..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting Job..." : "Post Job"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default JobForm;
