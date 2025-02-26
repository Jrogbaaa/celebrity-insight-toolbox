
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface DemographicsDisplayProps {
  demographics: {
    age_groups?: { [key: string]: string };
    gender?: { [key: string]: string };
    top_locations?: string[];
  };
}

export const DemographicsDisplay = ({ demographics }: DemographicsDisplayProps) => {
  const COLORS = ['#9b87f5', '#7E69AB', '#D6BCFA', '#E5DEFF', '#8B5CF6', '#D946EF'];
  
  // Ensure demographics data exists and has the correct properties
  const safeDemo = {
    age_groups: demographics?.age_groups || {},
    gender: demographics?.gender || {},
    top_locations: demographics?.top_locations || []
  };
  
  // Convert age data to chart format
  const ageData = Object.entries(safeDemo.age_groups).map(([age, value]) => ({
    name: age,
    value: parseFloat(value) || 0
  }));

  // Convert gender data to chart format
  const genderData = Object.entries(safeDemo.gender).map(([gender, value]) => ({
    name: gender,
    value: parseFloat(value) || 0
  }));

  // If no valid data, show a placeholder message
  const hasValidAgeData = ageData.length > 0 && ageData.some(d => d.value > 0);
  const hasValidGenderData = genderData.length > 0 && genderData.some(d => d.value > 0);

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Audience Demographics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(hasValidAgeData || hasValidGenderData) ? (
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Age Distribution</h3>
              {hasValidAgeData ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {ageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                      <Legend 
                        layout="vertical" 
                        align="right"
                        verticalAlign="middle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No age data available
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Gender Distribution</h3>
              {hasValidGenderData ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                      <Legend 
                        layout="vertical" 
                        align="right"
                        verticalAlign="middle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No gender data available
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No demographic data available for this profile
          </div>
        )}
      </CardContent>
    </Card>
  );
};
