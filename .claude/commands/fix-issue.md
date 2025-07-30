Complete issue #$ARGUMENTS from the git repo. (The parallel version in todos is an earlier draft of that.)

PLAN
As you examine the deliverables for this issue, think ahead to the bash commands you'll need to execute, files you'll need to touch, and abstractions/functions you'll need to work on. Which acceptance criteria are most likely to need a lot of debugging? Which have the risk of going fine for now, but coming back to bite us later? Allocate your planning toward these delicate aspects.

For each "interactive-pre" item (which are usually architectural), prepare a mini report of multiple options, and wait for Will's feedback. Begin your report with the option that seems the most popular or obvious. Then, include an acceptable but significantly different option. (Include multiple others if needed.) Finally, include a new option that's NOT recommended. For each option, briefly describe it, analyze short- and long-term implications for this project, and include indicators from the PRD or other docs that might lean toward one or another option. Conclude with your recommendation. Expect to include the collaborative rationale for the selected decision (and sometimes, the rationale for why NOT to do a different decision) in the commit. Favor decisions with strong long-term payoff for this project (at least through Phase 1, and even further). Once Will gives the go-ahead, keep going.

For "interactive-post" items (usually design-related), do not wait to get Will's feedback. Instead, take the perspective of a designer. Determine 2-3 distinct directions that all attempt to follow through on the vision that's been established so far. Be ready to code at a level of generality where any of the designs can be swapped in. (If this is infeasible, surface it up front.)

CREATE & TEST
Work incrementally. 
Test as you go. Most test items are keyed to one or two acceptance criteria.

If you encounter unexpected difficulties with this issue, surface them to Will. There are sometimes gaps in the documentation or conceptual lack of clarity. It's better to bring things like this up directly; do not fake their solution. 

Code all of the 'designer's' ideas for the interactive-post items. Save a visual representation of them through Playwright; integrate those into a report that Will can use. Save the report screenshots in the docs/development-screenshots, with a new folder for this issue; update the README to narrate those choices. Then check in with Will and pause for his feedback on which direction to go. Like the engineering choices, expect for the rationale of Will's decision to make it into the commit.

DEPLOY
Assuming you're able to finish the issue, be ready to wrap it all into a git commit. First, add the files that are needed. Then, if any untracked changes remain, including throwaway trial code, remove it, so that we have a clean working tree. If any new commands are relevant for Will's investigation (e.g., how to use a certain tool in dev), add those to the Claude "For Will" header. If significant new developments have been made to the project plan (especially in terms of design specificity), then edit the PRD itself. Finally, commit all these changes. When the commit has been accepted, you can close the issue. 

Thanks in advance for your help on this issue!