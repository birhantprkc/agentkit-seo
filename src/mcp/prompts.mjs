import { summarizeContext } from "../context/summary.mjs";
import { findDefaultCareerContext } from "./locator.mjs";

export function listMcpPrompts() {
  return {
    prompts: [
      {
        name: "cv_tailoring",
        description: "Tailor a resume or CV to a target job role using verified Career Context without hallucinating experience.",
        arguments: [
          {
            name: "targetRole",
            description: "The job title or role being targeted (e.g. 'Senior Distributed Systems Engineer').",
            required: true
          },
          {
            name: "jobDescription",
            description: "Optional job posting or description text to match keywords against verified evidence.",
            required: false
          }
        ]
      },
      {
        name: "linkedin_audit",
        description: "Audit a LinkedIn profile against the VitaeContext scorecard, positioning, and discoverability rules.",
        arguments: [
          {
            name: "profileSnapshot",
            description: "Pasted text or sections from the current LinkedIn profile.",
            required: false
          }
        ]
      },
      {
        name: "github_showcase",
        description: "Audit and optimize a GitHub profile README, pinned repositories, and developer positioning.",
        arguments: [
          {
            name: "focus",
            description: "Target engineering direction or domain to highlight.",
            required: false
          }
        ]
      },
      {
        name: "career_context_intake",
        description: "Scaffold or update the private Career Context file from scattered CVs, notes, and profile exports.",
        arguments: [
          {
            name: "rawNotes",
            description: "Raw career text, bullet points, or past project summaries to synthesize.",
            required: false
          }
        ]
      }
    ]
  };
}

export function getMcpPrompt(name, args = {}, repoRoot = null, config = null, options = {}) {
  const context = findDefaultCareerContext(options.contextPath, repoRoot);
  let contextText = "No Career Context file found. Proceeding with user-provided input only.";
  if (context.exists) {
    try {
      const surface = name === "cv_tailoring" ? "cv" : name === "linkedin_audit" ? "linkedin" : "general";
      contextText = summarizeContext(context.path, surface).content;
    } catch {
      // Keep fallback note
    }
  }

  if (name === "cv_tailoring") {
    const role = args.targetRole || "Target Professional Role";
    const jdSection = args.jobDescription
      ? `\n\nTARGET JOB DESCRIPTION:\n\`\`\`text\n${args.jobDescription}\n\`\`\`\n`
      : "";

    return {
      description: `Tailor CV for ${role}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are acting as an executive technical resume writer and ATS specialist using VitaeContext.\n\n` +
              `TASK: Tailor the user's CV for the role of "${role}".\n\n` +
              `STRICT RULES:\n` +
              `1. NEVER invent skills, tools, companies, dates, or metrics not grounded in the verified Career Context below.\n` +
              `2. If a required job skill is missing from verified context, flag it as an evidence gap rather than inventing it.\n` +
              `3. Structure bullet points using action-verb + problem/context + quantifiable metric where verified.\n` +
              jdSection +
              `\nVERIFIED CAREER CONTEXT:\n${contextText}\n\n` +
              `Please produce a tailored CV draft with an ATS-safe clean structure.`
          }
        }
      ]
    };
  }

  if (name === "linkedin_audit") {
    const snapshot = args.profileSnapshot ? `\n\nCURRENT PROFILE SNAPSHOT:\n${args.profileSnapshot}\n` : "";
    return {
      description: "Audit LinkedIn Profile",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are acting as a senior technical recruiter and LinkedIn positioning advisor using VitaeContext.\n\n` +
              `TASK: Audit the LinkedIn profile for search discoverability, clear positioning, and recruiter scannability.\n` +
              snapshot +
              `\nVERIFIED CAREER CONTEXT:\n${contextText}\n\n` +
              `Provide prioritized recommendations (Headline, About, Experience, Featured, Skills) with ready-to-paste drafts grounded in verified evidence.`
          }
        }
      ]
    };
  }

  if (name === "github_showcase") {
    return {
      description: "Audit GitHub Profile & Showcase",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are acting as an open-source maintainer and hiring manager using VitaeContext.\n\n` +
              `TASK: Review developer positioning, GitHub profile README, and pinned repository strategy.\n` +
              `FOCUS: ${args.focus || "Primary engineering expertise"}\n\n` +
              `VERIFIED CAREER CONTEXT:\n${contextText}\n\n` +
              `Draft an impactful profile README and suggest 3-4 pinned repositories with clear descriptions, topics, and proof links.`
          }
        }
      ]
    };
  }

  if (name === "career_context_intake") {
    return {
      description: "Build or Update Private Career Context",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are the VitaeContext Context Builder.\n\n` +
              `TASK: Help synthesize raw career notes into a structured, verified Career Context file.\n\n` +
              (args.rawNotes ? `RAW NOTES:\n${args.rawNotes}\n\n` : "") +
              `Guide the user through organizing their career facts into standard sections: Goals & Targeting, Quick Reference, Professional Experience, Education, Projects, and Skills.`
          }
        }
      ]
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
}
