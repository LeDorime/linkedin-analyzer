"use client";

import { GOALS, type ProfileInput } from "@/lib/grading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type Props = {
  value: ProfileInput;
  onChange: (next: ProfileInput) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function ProfileForm({ value, onChange, onSubmit, loading }: Props) {
  function set<K extends keyof ProfileInput>(key: K, next: ProfileInput[K]) {
    onChange({ ...value, [key]: next });
  }

  const canSubmit =
    Boolean(value.headline.trim() && value.about.trim()) && !loading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your LinkedIn profile</CardTitle>
        <CardDescription>
          Paste each section from your profile. Headline and About are required;
          the more you add, the sharper the feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="goal">What is this profile for?</Label>
            <Select
              value={value.goal}
              onValueChange={(next) =>
                set("goal", next as ProfileInput["goal"])
              }
              items={GOALS as unknown as { value: string; label: string }[]}
            >
              <SelectTrigger id="goal" className="w-full">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              placeholder="e.g. Senior Product Designer building tools for developers"
              value={value.headline}
              onChange={(event) => set("headline", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">About / summary</Label>
            <Textarea
              id="about"
              rows={6}
              placeholder="Paste your About section here."
              value={value.about}
              onChange={(event) => set("about", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              rows={8}
              placeholder="Paste your roles and the bullet points under each one."
              value={value.experience}
              onChange={(event) => set("experience", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              rows={3}
              placeholder="Comma-separated, or one per line."
              value={value.skills}
              onChange={(event) => set("skills", event.target.value)}
            />
          </div>

          <Button type="submit" size="lg" disabled={!canSubmit}>
            {loading ? "Analyzing…" : "Analyze my profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
