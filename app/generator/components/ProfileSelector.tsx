"use client";

import type { Profile } from "@/types";

type ProfileSelectorProps = {
  profiles: Profile[];
  selectedProfileId: string | null;
  selectedLevel: "lite" | "full";
  onProfileChange: (profileId: string) => void;
  onLevelChange: (level: "lite" | "full") => void;
};

export function ProfileSelector({
  profiles,
  selectedProfileId,
  selectedLevel,
  onProfileChange,
  onLevelChange,
}: ProfileSelectorProps) {
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  // ドメインでグループ化
  const groupedProfiles = profiles.reduce((acc, profile) => {
    if (!acc[profile.domain]) {
      acc[profile.domain] = [];
    }
    acc[profile.domain].push(profile);
    return acc;
  }, {} as Record<string, Profile[]>);

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-bold text-foreground">プロファイル選択</h2>
      
      {/* プロファイル選択 */}
      <div>
        <label htmlFor="profile-select" className="label-base block mb-2">
          テンプレートプロファイル
        </label>
        <select
          id="profile-select"
          value={selectedProfileId || ""}
          onChange={(e) => onProfileChange(e.target.value)}
          className="input-base w-full"
        >
          <option value="">プロファイルを選択してください</option>
          {Object.entries(groupedProfiles).map(([domain, domainProfiles]) => (
            <optgroup key={domain} label={domain}>
              {domainProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        
        {selectedProfile && (
          <p className="mt-2 text-sm text-foreground/70">
            {selectedProfile.description}
          </p>
        )}
      </div>

      {/* レベル選択 */}
      {selectedProfile && (
        <div>
          <label className="label-base block mb-2">テンプレートレベル</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="level"
                value="lite"
                checked={selectedLevel === "lite"}
                onChange={(e) => onLevelChange(e.target.value as "lite")}
                className="w-4 h-4 text-primary bg-background border-border focus:ring-2 focus:ring-primary/50"
              />
              <div>
                <span className="font-medium">Lite</span>
                <span className="ml-2 text-sm text-foreground/70">
                  {selectedProfile.levels.lite.description}
                </span>
              </div>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="level"
                value="full"
                checked={selectedLevel === "full"}
                onChange={(e) => onLevelChange(e.target.value as "full")}
                className="w-4 h-4 text-primary bg-background border-border focus:ring-2 focus:ring-primary/50"
              />
              <div>
                <span className="font-medium">Full</span>
                <span className="ml-2 text-sm text-foreground/70">
                  {selectedProfile.levels.full.description}
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
