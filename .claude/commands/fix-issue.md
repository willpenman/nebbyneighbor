Complete issue #$ARGUMENTS from the git repo, read it with `gh issue view $ARGUMENTS`.

PLAN
As you examine the deliverables for this issue, think ahead to the bash commands you'll need to execute, files you'll need to touch, and abstractions/functions you'll need to work on. Write down for yourself: Which acceptance criteria are most likely to need a lot of debugging? Which have the risk of going fine for now, but coming back to bite us later? Allocate your planning toward these delicate aspects.

For each "interactive-pre" item (which are usually architectural), prepare a mini report of multiple options, and wait for Will's feedback. Begin your report with the option that seems the most popular or obvious. Then, include an acceptable but significantly different option. (Include multiple others if needed.) Finally, include a new option that's NOT recommended. For each option, briefly describe it, analyze short- and long-term implications for this project, and include indicators from the PRD or other docs that might lean toward one or another option. Conclude with your recommendation. Expect to include the collaborative rationale for the selected decision (and sometimes, the rationale for why NOT to do a different decision) in the commit. Favor decisions with strong long-term payoff for this project (at least through Phase 1, and even further). *After* Will gives the go-ahead, keep going.

For "interactive-post" items (usually design-related), do not wait to get Will's feedback. Instead, take the perspective of a designer. Determine 2-3 distinct directions that all attempt to follow through on the vision that's been established so far. In general, expect that the design decision Will makes will go 'deeper' into the same kind of style; do not treat previous design options as still present. Be ready to code at a level of generality where any of the design concepts for this issue can be swapped in. (If this is infeasible, surface it up front.)

CREATE & TEST
Work incrementally. 

Test as you go, using vite+Playwright to assess functionality and visual design intent. Most test items are keyed to one or two acceptance criteria. When you run `npm run dev &` (or a variant), note that there's no feedback, *you still have to use Playwright to do anything visually*. In other words, it's really two commands, don't just wait for something to happen after the first one. Debugging: Will may accidentally still have his own terminal running, consult with him before trying a full build; alternatively, vite may already be running (or the opposite), check its status. 

For interactive-post items, code all of the 'designer's' ideas. Behavioral functionality will go in the main page immediately. Use src/dev/README.md to guide you on where/how to place styling choices, note that you will be working in both docs/development/issue-N, and /src/dev/index-N. In the main page, get the style options from the index-N styles, so that the style selector works.

Document the options - ensure the relevant parts of each design are completely visible, then take 1-2 screenshots through Playwright into the issue-specific development folder. Test on iPhone 14 Pro (393x852) AND desktop (1200x800) sizes, to confirm scaling. (Pay attention to space around.) Write a brief readme to narrate the design options (and to trial keywords for the emerging design vision.)

If you encounter unexpected difficulties with this issue, surface them to Will. There are sometimes gaps in the documentation or conceptual lack of clarity. It's better to bring things like this up directly; do not fake their solution. 


FINALIZE AND DEPLOY
Assuming you're able to finish the issue - 
First, finalize interactive-post items by presenting the relevant link to Will. Pause for his feedback on which direction to go. Like the engineering choices in interactive-pre, expect for the rationale of Will's decision to make it into the commit. 

Build in the selected option as the default for the site; retain the functional dev page (incl issue-specific config file) with design options as archival.

Then, add to the PRD's "Design (Ongoing)" section, since the design vision is evolving. Be brief; we will gradually aggregate and work toward a coherent design vision. Check with Will for particularly tricky descriptions of the design and/or categories (is this choice ultimately about 'usability', or about player discovery/'enjoyment'?) Provisionally remove this issue from the priority queue in the todos.

Then, wrap it all into a git commit. First, stage the files that are needed. Then, if any untracked changes remain, including throwaway trial code, remove it, so that we have a clean working tree. If any new commands are relevant for Will's investigation (e.g., how to use a certain tool in dev), add those to the Claude "For Will" header. 

Then, commit all these changes. 

After the commit has been accepted, close the issue. Run `pkill -f "vite"` to clear things for the upcoming work.

Thanks in advance for your help on this issue!