Complete issue #$ARGUMENTS from the git repo, read it with `gh issue view $ARGUMENTS`.

Step 1. PLAN
As you examine the deliverables for this issue, think ahead to the bash commands you'll need to execute, files you'll need to touch, and abstractions/functions you'll need to work on. Write down for yourself: Which acceptance criteria are most likely to need a lot of debugging? Which have the risk of going fine for now, but coming back to bite us later? Allocate your planning toward these delicate aspects.

For each "interactive-pre" item (which are usually architectural), prepare a mini report of multiple options, and ask for Will's feedback (on one item at a time). Begin your report with the option that seems the most popular or obvious. Then, include an acceptable but significantly different option. (Include multiple others if needed.) Finally, include a new option that's NOT recommended. For each option, briefly describe it, analyze short- and long-term implications for this project (especially using what you know of what's on the feature roadmap), and include indicators from the PRD or other docs that might lean toward one or another option. Conclude with your recommendation. Expect to include the collaborative rationale for the selected decision (and sometimes, the rationale for why NOT to do a different decision) in the commit. Favor decisions with strong long-term payoff for this project (at least through Phase 1, and even further). Pause there. *After* Will gives the go-ahead, keep going.

For "interactive-post" items (usually design-related), do not wait to get Will's feedback. Instead, take the perspective of a designer. You may even spin up a sub-agent if you'd like to get ideas. We'll want to plan 2-3 distinct design concepts that all extend the vision and design aesthetic that's been established so far. Your toolkit consists of: a) styling (color, thickness, visual hierarchy, font, placement, size, etc.), b) visual metaphors (relating to degree of success/failure, visibility, game state, game metaphor, etc.), c) player psychology for a puzzle game (augmenting or enhancing ease, stakes/reversibility of actions, enjoyment, intuition, challenge), and d) comprehension (especially when text is minimal). Using these elements, there is more than enough room to generate different options while still being grounded in the existing design. One way to think of this work is as a consultant for a client who doesn't even know what design options they have, and isn't able to think creatively enough to generate multiple ideas; but with your deep understanding of the problem space, you can surface multiple possibilities for them. Note that you will follow a two-stage process split across multiple files, so you'll want to have these concepts developed before you move into the create step.


Step 2. CREATE & TEST
Begin by running `npm run dev &` - *you won't get any feedback from it unless there's been an error, so just keep going, don't wait for something to happen*. Now you can do whatever you need to throughout this task, including using Playwright, and since vite hot-reloads, you don't have to run anything extra before testing.

Create a new directory in @docs/development, named issue-N, which will host design concept definitions and screenshotted results from your work. So for now, it's a place to put things, but once we're finished with this issue, it will serve as an archive of the process.

Work incrementally. 

Test as you go, using vite+Playwright to assess functionality and visual design intent. Most test items are keyed to one or two acceptance criteria.

For interactive-post items (i.e. implementing the 'designer's' ideas), your work at this step will be split across multiple files. Changes related to behavioral functionality will go into the main files immediately. Refer to the Design Tests section in your claude file for how to code the various stylistic options. 

Document the interactive-post options with Playwright - navigate to the ?issue=N page, select the option that you'd like to document, ensure the relevant parts of that design are completely visible, then take a screenshot through Playwright into the issue-specific development folder. Test on iPhone 14 Pro (393x852) AND desktop (1200x800) sizes, to confirm scaling. (Pay attention to space around.) No readme necessary.

If you encounter unexpected difficulties with this issue, surface them to Will. There are sometimes gaps in the documentation or conceptual lack of clarity. It's better to bring things like this up directly; do not fake their solution. 


Step 3. FINALIZE AND DEPLOY
Assuming you're able to finish the issue - 
First, finalize interactive-post items by presenting the relevant link to Will. Pause for his feedback on which direction to go. Like the engineering choices in interactive-pre, expect for the rationale of Will's decision to make it into the commit. 

Build in the selected option as the default for the site; retain the functional dev page (incl issue-specific config file) with design options as archival.

Then, add to the PRD's "Design (Ongoing)" section, since the design vision is evolving. Be brief; we will gradually aggregate and work toward a coherent design vision. Check with Will for particularly tricky descriptions of the design and/or categories (is this choice ultimately about 'usability', or about player discovery/'enjoyment'?) Provisionally remove this issue from the priority queue in the todos doc.

Then, wrap it all into a git commit. First, stage the files that are needed. Then, if any untracked changes remain, remove it, so that we have a clean working tree. If any new commands are relevant for Will's investigation (e.g., how to use a certain tool in dev), add those to the Claude "For Will" header. 

Then, commit all these changes. 

After the commit has been accepted, close the issue. Exit the dev server to clear things for the upcoming work.

Thanks in advance for your help on this issue!