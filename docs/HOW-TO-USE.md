# How To Use The Living Constitution 2.0

<!-- <default-directions> -->

You cannot break this system by following these steps.
Seeing text you do not understand is normal. The steps tell you what to expect.
You can stop at any time. Stopping does not delete anything.
You can take breaks. The session will wait for you.

## What this guide does

Part 1: Steps 1 to 5 — check that the system is intact before starting.
Part 2: Steps 6 to 11 — start a governed work session.
Part 3: Steps 12 to 17 — end the session and save your work.

## Part 1 — Check the system

1
Open Terminal.

What you will see: A window with a mostly empty black or white screen and a blinking mark.

If it looks different: If you see the word Error instead of a blinking mark, stop here. Do not continue. Send me the exact words on screen.

Likely mistake: Opening a different app, such as iTerm2 or a code editor, instead of the app named Terminal. If this happens: Close that app, then find the app named Terminal in your Applications folder or Dock and open that one.

---

2
Type this command into Terminal:

```
node ~/Projects/the-living-constitution-2.0/scripts/tlc-health.mjs
```

What you will see: The command appears in Terminal as you type.

Likely mistake: Pasting the command without the cursor being at the Terminal prompt. If this happens: Click inside the Terminal window so the blinking mark is visible, then paste the command again.

---

3
Press the Return key.

What you will see: Several lines starting with a checkmark symbol, then one final line that reads exactly: HEALTHY  0 critical, 0 warning(s)

If it looks different: If the final line says DEGRADED or CRITICAL instead, stop here. Do not continue. Send me the full output you see on screen.

Likely mistake: Pressing a different key, such as Enter on a separate number pad, instead of the Return key on the main keyboard. If this happens: The command may have behaved unexpectedly. Press the up-arrow key to bring back the command and press the Return key labeled on the main keyboard.

---

4
Type this command into Terminal:

```
node ~/Projects/the-living-constitution-2.0/scripts/tlc-dashboard.mjs
```

What you will see: The command appears in Terminal as you type.

Likely mistake: Typing the command in a different application window instead of Terminal. If this happens: Click the Terminal window so it is in focus, then type the command again.

---

5
Press the Return key.

What you will see: A list of module names in capital letters with hyphens. Each name is followed by a status word. Example: working AGENT-SENTINEL

If it looks different: If you see the word Error or the word undefined anywhere in the output, stop here. Do not continue. Send me the exact output.

Likely mistake: Reading the output before it has fully finished printing. If this happens: Wait until the Terminal prompt appears again on a line with no output after it, then read the full output.

---

## Part 2 — Start a session

6
Look at the module list that Terminal is currently showing. Find the module name you want to work on. Write the name down exactly as it appears. Module names are in capital letters with hyphens.

What you will see: You have the module name written down.

If it looks different: If no module names with hyphens appear in the output, stop here. Do not continue. Send me the Terminal output and tell me which project you want to work on.

Likely mistake: Writing down only part of the module name instead of the complete name with all hyphens. If this happens: Look at the Terminal output again and copy the full name exactly, including every capital letter and every hyphen.

---

7
Type this command into Terminal. Replace YOUR-MODULE-NAME with the module name you wrote down.

```
node ~/Projects/the-living-constitution-2.0/scripts/tlc-work.mjs --module YOUR-MODULE-NAME
```

What you will see: The command appears in Terminal as you type.

Likely mistake: Leaving the placeholder text YOUR-MODULE-NAME in the command instead of replacing it with the actual module name. If this happens: Press the up-arrow key to bring back the command, select YOUR-MODULE-NAME, type the actual module name in its place, then press Return.

---

8
Press the Return key.

What you will see: A message that says the session has started. The file .ai-context/active-session.md is written.

If it looks different: If you see the words Module not found or the word Error, stop here. Do not continue. Send me the exact output and the module name you used.

Likely mistake: Pressing Return before finishing typing the complete command. If this happens: Wait for the Terminal prompt to return, then type `node ~/Projects/the-living-constitution-2.0/scripts/tlc-work.mjs --module YOUR-MODULE-NAME` again with the actual module name replacing YOUR-MODULE-NAME, and press Return only after the full command is typed.

---

9
Open Hermes.

What you will see: The Hermes prompt and a blinking cursor.

If it looks different: If Hermes does not open or shows the word Error, stop here. Do not continue. Send me any error message you see.

Likely mistake: Opening a different AI assistant instead of Hermes. If this happens: Close that application and open Hermes by typing the command `hermes` in a Terminal window and pressing Return.

---

10
Type this message into Hermes. Replace YOUR-MODULE-NAME with the module name you wrote down in step 6.

```
Read ~/.the-living-constitution-2.0/.ai-context/active-session.md before responding. Operating under contract CRSP-YOUR-MODULE-NAME.
```

What you will see: The message text appears in Hermes as you type.

Likely mistake: Leaving the placeholder text YOUR-MODULE-NAME in the message instead of replacing it with the actual module name. If this happens: Delete the message before sending it, then retype it with the actual module name in place of YOUR-MODULE-NAME.

---

11
Press the Return key.

What you will see: Hermes confirms it has read the contract and states the scope before responding to anything else.

If it looks different: If Hermes responds without mentioning the contract or the module name, stop here. Start a new Hermes conversation and repeat steps 9 and 10 before typing anything else.

Likely mistake: Sending the message before replacing YOUR-MODULE-NAME with the actual module name. If this happens: Start a new Hermes conversation and repeat steps 9 and 10 with the correct module name in the message.

---

## Part 3 — End the session

12
Type this command into Terminal. Replace YOUR-MODULE-NAME with the module name you wrote down.

```
node ~/Projects/the-living-constitution-2.0/scripts/tlc-done.mjs --module YOUR-MODULE-NAME
```

What you will see: The command appears in Terminal as you type.

Likely mistake: Leaving YOUR-MODULE-NAME in the command without replacing it with the actual module name. If this happens: Press the up-arrow key to bring back the command, select YOUR-MODULE-NAME, type the actual module name, then press Return.

---

13
Press the Return key.

What you will see: A message that says STATUS.md has been updated and the session record is closed.

If it looks different: If you see the word Error, stop here. Do not continue. Send me the exact output.

Likely mistake: Running this command before the work from the session has been saved. If this happens: Send me the error message and I will identify what needs to be saved first.

---

14
Type this command into Terminal:

```
git -C ~/Projects/the-living-constitution-2.0 add -A
```

What you will see: The command appears in Terminal as you type.

Likely mistake: Typing this command without the `-C ~/Projects/the-living-constitution-2.0` part, which would run git in the wrong directory. If this happens: Press the up-arrow key to bring back the command, compare it to the guide, add the missing part, then press Return.

---

15
Press the Return key.

What you will see: No output. A blank line and a blinking mark. This is expected and means the command worked.

If it looks different: If you see the word Error or the word fatal, stop here. Do not continue. Send me the exact output.

Likely mistake: Expecting to see a confirmation message and thinking that no output means the command failed. If this happens: No output after this command is correct. Continue to step 16.

---

16
Type this command into Terminal. Replace describe what you did with a short description of the work you did this session. Keep the quotation marks in place.

```
git -C ~/Projects/the-living-constitution-2.0 commit -m "Session: YOUR-MODULE-NAME — describe what you did"
```

What you will see: The command appears in Terminal as you type.

Likely mistake: Removing the quotation marks around the commit message when typing the command. If this happens: Press the up-arrow key to bring back the command, add the quotation marks back around the message text, then press Return.

---

17
Press the Return key.

What you will see: A line that starts with the word main followed by a short code. The session is now saved.

If it looks different: If you see the words pre-commit hook failed, read the lines above those words. They name the rule that was violated. Fix the issue those lines describe. Then repeat steps 14 and 16. If you cannot fix the issue, type this command into Terminal instead, then press the Return key. Send me the output.

```
TLC_BYPASS_HOOKS=1 git -C ~/Projects/the-living-constitution-2.0 commit -m "Session: YOUR-MODULE-NAME — describe what you did"
```

Likely mistake: Pressing Return before finishing typing the complete commit command with your description. If this happens: Wait for the Terminal prompt to return, then type `git -C ~/Projects/the-living-constitution-2.0 commit -m "Session: YOUR-MODULE-NAME — describe what you did"` again with your actual module name and description, then press Return.

---

## If a thought interrupts the session

If a thought says this is not working or you should be working on something else: the contract file for your module is the anchor. The contract file is in `contracts/active/`. The scope section inside it names exactly what belongs in this session. A thought that is outside the scope is not part of this session's work. You agreed to the scope before starting.

The session can be ended at any time by running the tlc-done command in Part 3. Ending early is a valid action. Nothing is lost.

## Word list

**Terminal**
An app on your Mac where you type commands. It shows a mostly empty screen with a blinking mark.

**Cursor**
The small blinking mark in Terminal. When you see it, Terminal is ready for you to type.

**Return key**
The large key labeled Return on your keyboard. Press it after typing a command to run that command.

**Module**
One project in the system. Each module has a name in capital letters and a status word.

**Module name**
The name of one project, written in capital letters with hyphens between words. Example: AGENT-SENTINEL.

**Session**
A block of focused work time on one module. A session has a start step and an end step.

**Contract**
A file that says what you are working on, what counts as finished, and what to do if something goes wrong.

**Scope**
The list of things the contract says you are allowed to work on in this session.

**Status word**
A word that says how far along a module is. The three status words are: working, partial, and not-yet-checked.

**Dashboard**
The list of all modules and their status words. It appears when you run the tlc-dashboard command.

**Commit**
Saving a snapshot of your work. Each snapshot is permanent and has a short code that identifies it.

**Hook**
A check that runs automatically when you commit. It makes sure the work follows the rules before the snapshot is saved.

**Hermes**
The AI assistant used with this system. You run it in Terminal.

**Contract file**
A file in the contracts folder that describes the scope and rules for one module.
