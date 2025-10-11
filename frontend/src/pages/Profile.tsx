import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  Phone,
  Mail,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts";
import {
  ProfileUpdateRequest,
  FreelancerProfile,
  ClientProfile,
  FreelancerCreateRequest,
  ClientCreateRequest,
} from "@/types/auth";
import authService from "@/services/authService";

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [roleProfile, setRoleProfile] = useState<
    FreelancerProfile | ClientProfile | null
  >(null);
  const [hasRoleProfile, setHasRoleProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Form states
  const [userFormData, setUserFormData] = useState<ProfileUpdateRequest>({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    profile_picture: "",
  });

  const [freelancerFormData, setFreelancerFormData] =
    useState<FreelancerCreateRequest>({
      title: "",
      category: "",
      rate: "",
      skills: "",
      bio: "",
      location: "",
    });

  const [clientFormData, setClientFormData] = useState<ClientCreateRequest>({
    company_name: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Categories for freelancers
  const freelancerCategories = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "Data Science",
    "DevOps",
    "Consulting",
    "Other",
  ];

  useEffect(() => {
    if (user) {
      // Initialize user form data
      setUserFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        profile_picture: user.profile_picture || "",
      });

      // Fetch complete profile including role-specific data
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);

      // Fetch complete profile data using the combined profile endpoint
      const profileData = await authService.getProfile();

      // Update user form data with user profile data
      setUserFormData({
        first_name: profileData.user.first_name || "",
        last_name: profileData.user.last_name || "",
        phone: profileData.user.phone || "",
        bio: profileData.user.bio || "",
        profile_picture: profileData.user.profile_picture || "",
      });

      // Handle role-specific profile data
      setHasRoleProfile(profileData.has_role_profile || false);
      setRoleProfile(profileData.role_profile);

      if (profileData.role_profile) {
        // Populate form data based on user role
        if (user?.role === "freelancer") {
          setFreelancerFormData({
            title: profileData.role_profile.title || "",
            category: profileData.role_profile.category || "",
            rate: profileData.role_profile.rate
              ? profileData.role_profile.rate.toString()
              : "",
            skills: profileData.role_profile.skills || "",
            bio: profileData.role_profile.bio || "",
            location: profileData.role_profile.location || "",
          });
        } else if (user?.role === "client") {
          setClientFormData({
            company_name: profileData.role_profile.company_name || "",
          });
        }
      } else {
        // Clear role profile form data if no profile exists
        if (user?.role === "freelancer") {
          setFreelancerFormData({
            title: "",
            category: "",
            rate: "",
            skills: "",
            bio: "",
            location: "",
          });
        } else if (user?.role === "client") {
          setClientFormData({
            company_name: "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setErrorMessage("Failed to load profile data");
    } finally {
      setProfileLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(
      0
    )}`.toUpperCase();
  };

  const handleUserFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFreelancerFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFreelancerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClientFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateUserForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!userFormData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!userFormData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (userFormData.phone && !/^\+?[\d\s\-()]+$/.test(userFormData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRoleForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (user?.role === "freelancer") {
      if (!freelancerFormData.title?.trim()) {
        newErrors.title = "Professional title is required";
      }
      if (!freelancerFormData.category?.trim()) {
        newErrors.category = "Category is required";
      }
      if (
        freelancerFormData.rate &&
        !/^\d+(\.\d{2})?$/.test(freelancerFormData.rate)
      ) {
        newErrors.rate = "Please enter a valid rate (e.g., 25.00)";
      }
    } else if (user?.role === "client") {
      if (!clientFormData.company_name?.trim()) {
        newErrors.company_name = "Company name is required";
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateUserForm()) {
      return;
    }

    try {
      // Prepare combined data for the unified endpoint
      let combinedData = { ...userFormData };

      // Add role-specific data if needed
      if (!hasRoleProfile || validateRoleForm()) {
        if (user?.role === "freelancer") {
          combinedData = { ...combinedData, ...freelancerFormData };
        } else if (user?.role === "client") {
          combinedData = { ...combinedData, ...clientFormData };
        }
      }

      // Update profile using the combined endpoint
      const updatedProfile = await authService.updateProfile(combinedData);

      // Update local state with the response
      setHasRoleProfile(updatedProfile.has_role_profile || false);
      setRoleProfile(updatedProfile.role_profile);

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);

      // Refresh profile data to ensure consistency
      await fetchProfileData();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (user) {
      setUserFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        profile_picture: user.profile_picture || "",
      });
    }

    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please log in to view your profile
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences
              </p>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Main Profile Card */}
            <Card className="shadow-card-hover">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1" />
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={user.profile_picture}
                        alt={`${user.first_name} ${user.last_name}`}
                      />
                      <AvatarFallback className="text-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <CardTitle className="text-2xl">
                        {user.first_name} {user.last_name}
                      </CardTitle>
                      <CardDescription className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                        <span className="text-sm">@{user.username}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="first_name"
                          name="first_name"
                          value={userFormData.first_name}
                          onChange={handleUserFormChange}
                          className={errors.first_name ? "border-red-500" : ""}
                        />
                      ) : (
                        <p className="mt-2 text-sm">{user.first_name}</p>
                      )}
                      {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.first_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="last_name"
                          name="last_name"
                          value={userFormData.last_name}
                          onChange={handleUserFormChange}
                          className={errors.last_name ? "border-red-500" : ""}
                        />
                      ) : (
                        <p className="mt-2 text-sm">{user.last_name}</p>
                      )}
                      {errors.last_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.last_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="mt-2 text-sm">{user.email}</p>
                    </div>

                    <div>
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          name="phone"
                          value={userFormData.phone}
                          onChange={handleUserFormChange}
                          placeholder="Enter your phone number"
                          className={errors.phone ? "border-red-500" : ""}
                        />
                      ) : (
                        <p className="mt-2 text-sm">
                          {user.phone || "Not provided"}
                        </p>
                      )}
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        name="bio"
                        value={userFormData.bio}
                        onChange={handleUserFormChange}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    ) : (
                      <p className="mt-2 text-sm">
                        {user.bio || "No bio provided"}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Role-specific Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {user.role === "freelancer" ? (
                      <Briefcase className="h-5 w-5" />
                    ) : (
                      <Building className="h-5 w-5" />
                    )}
                    {user.role === "freelancer"
                      ? "Professional Details"
                      : "Company Details"}
                    {profileLoading && (
                      <span className="text-sm text-muted-foreground ml-2">
                        Loading...
                      </span>
                    )}
                  </h3>

                  {user.role === "freelancer" && (
                    <div className="space-y-4">
                      {!hasRoleProfile && isEditing && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            Complete your freelancer profile to start receiving
                            job opportunities.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Professional Title</Label>
                          {isEditing ? (
                            <Input
                              id="title"
                              name="title"
                              value={freelancerFormData.title}
                              onChange={handleFreelancerFormChange}
                              placeholder="e.g., Full-stack Developer"
                              className={errors.title ? "border-red-500" : ""}
                            />
                          ) : (
                            <p className="mt-2 text-sm">
                              {roleProfile?.title || "Not provided"}
                            </p>
                          )}
                          {errors.title && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.title}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="category">Category</Label>
                          {isEditing ? (
                            <Select
                              value={freelancerFormData.category}
                              onValueChange={(value) => {
                                setFreelancerFormData((prev) => ({
                                  ...prev,
                                  category: value,
                                }));
                                if (errors.category) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    category: "",
                                  }));
                                }
                              }}
                            >
                              <SelectTrigger
                                className={
                                  errors.category ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {freelancerCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="mt-2 text-sm">
                              {roleProfile?.category || "Not provided"}
                            </p>
                          )}
                          {errors.category && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.category}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label
                            htmlFor="rate"
                            className="flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4" />
                            Hourly Rate (USD)
                          </Label>
                          {isEditing ? (
                            <Input
                              id="rate"
                              name="rate"
                              value={freelancerFormData.rate}
                              onChange={handleFreelancerFormChange}
                              placeholder="e.g., 25.00"
                              className={errors.rate ? "border-red-500" : ""}
                            />
                          ) : (
                            <p className="mt-2 text-sm">
                              {roleProfile?.rate
                                ? `$${roleProfile.rate}/hour`
                                : "Not provided"}
                            </p>
                          )}
                          {errors.rate && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.rate}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label
                            htmlFor="location"
                            className="flex items-center gap-2"
                          >
                            <MapPin className="h-4 w-4" />
                            Location
                          </Label>
                          {isEditing ? (
                            <Input
                              id="location"
                              name="location"
                              value={freelancerFormData.location}
                              onChange={handleFreelancerFormChange}
                              placeholder="e.g., New York, USA"
                            />
                          ) : (
                            <p className="mt-2 text-sm">
                              {roleProfile?.location || "Not provided"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="skills">Skills</Label>
                        {isEditing ? (
                          <Textarea
                            id="skills"
                            name="skills"
                            value={freelancerFormData.skills}
                            onChange={handleFreelancerFormChange}
                            placeholder="e.g., React, Node.js, Python, Django"
                            rows={2}
                          />
                        ) : (
                          <div className="mt-2">
                            {roleProfile?.skills ? (
                              <div className="flex flex-wrap gap-2">
                                {roleProfile.skills
                                  .split(",")
                                  .map((skill, index) => (
                                    <Badge key={index} variant="outline">
                                      {skill.trim()}
                                    </Badge>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-sm">No skills provided</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {user.role === "client" && (
                    <div className="space-y-4">
                      {!hasRoleProfile && isEditing && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            Complete your company profile to start posting jobs.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div>
                        <Label
                          htmlFor="company_name"
                          className="flex items-center gap-2"
                        >
                          <Building className="h-4 w-4" />
                          Company Name
                        </Label>
                        {isEditing ? (
                          <Input
                            id="company_name"
                            name="company_name"
                            value={clientFormData.company_name}
                            onChange={handleClientFormChange}
                            placeholder="e.g., Acme Corporation"
                            className={
                              errors.company_name ? "border-red-500" : ""
                            }
                          />
                        ) : (
                          <p className="mt-2 text-sm">
                            {roleProfile?.company_name || "Not provided"}
                          </p>
                        )}
                        {errors.company_name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.company_name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Account Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Member Since</Label>
                      <p className="mt-2">
                        {new Date(user.date_joined).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div>
                      <Label>Last Login</Label>
                      <p className="mt-2">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Never"}
                      </p>
                    </div>

                    <div>
                      <Label>Email Verified</Label>
                      <div className="mt-2">
                        <Badge
                          variant={
                            user.email_verified ? "default" : "secondary"
                          }
                        >
                          {user.email_verified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>Account Status</Label>
                      <div className="mt-2">
                        <Badge
                          variant={user.is_active ? "default" : "destructive"}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
