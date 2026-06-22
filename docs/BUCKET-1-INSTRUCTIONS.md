# BUCKET 1 FIX — Step-by-Step Instructions

## What this guide does

This guide trains the nanochat module on a free GPU using Google Colab, saves the resulting checkpoint to your Google Drive, and records the result in TLC 2.0. When you finish, three modules (nanochat, governance-harness, autoresearch) will have real evidence and can advance from unverified to partial or working.

**What this fixes:** The 3 modules that need a GPU (nanochat, governance-harness, autoresearch)
**What you will have when done:** A trained nanochat checkpoint + probe scores on I1-I8
**Total time:** About 30 minutes of waiting, 10 minutes of your attention

---

<default-directions>

## BEFORE YOU START — Read this once

You cannot break your computer by following these steps.
A lot of text may appear on screen. Seeing text you do not understand is normal.
You can stop at any time. Stopping does not cause any harm.
You can take breaks. The steps will wait for you.

There are 38 steps.
Do them in order.
Do not skip any step.
Each step has exactly one action.
When a step says STOP AND WAIT, do nothing until you see the exact text described.

---

1. Open the browser you normally use. Safari, Chrome, and Firefox all work.
   **What you will see:** A browser window opens.

   Likely mistake: Opening a different app instead of a browser. If this happens: Close that app, then find and open Safari, Chrome, or Firefox from your Dock or Applications folder.

---

2. Click the address bar. The address bar is the long rectangle that shows the current web address.
   **What you will see:** The address bar becomes highlighted.

   Likely mistake: Clicking somewhere in the browser window that is not the address bar. If this happens: Look at the row containing the site address, find the long rectangle showing a web address, and click directly on that rectangle.

---

3. Type exactly this into the address bar:

   ```
   https://colab.research.google.com
   ```

   **What you will see:** The address appears in the address bar as you type.

   Likely mistake: Typing the address before clicking the address bar to select it first. If this happens: Click the address bar first to highlight it, then type the address.

---

4. Press Enter.
   **What you will see:** The Google Colab homepage loads.

   Likely mistake: Pressing a key other than Enter, such as Space or Escape. If this happens: Click the address bar, type `https://colab.research.google.com` into it, then press the key labeled Enter or Return.

---

5. If you see a button labeled "Sign in": click it and sign in using `your Google account email address`.
   If you do not see a button labeled "Sign in": skip to step 6.
   **What you will see:** You are signed in and the Colab homepage is visible.

   Likely mistake: Clicking "Sign in" when you are already signed in and the page shows your account. If this happens: If no "Sign in" button is visible, skip directly to step 6.

---

6. Press the Command key and the Space key at the same time.
   **What you will see:** The Spotlight search bar appears.

   Likely mistake: Pressing only the Command key or only the Space key instead of both together. If this happens: Release both keys, then press and hold the Command key, then press the Space key while still holding Command, then release both.

---

7. Type the word `Finder` into the Spotlight search bar.
   **What you will see:** A result labeled "Finder" appears in the search results.

   Likely mistake: Typing a word other than the exact word Finder, such as "find" or "file". If this happens: Press Escape to close Spotlight, press Command and Space again to reopen it, then type the word Finder.

---

8. Press Enter.
   **What you will see:** A new Finder window opens.

   Likely mistake: Pressing a different key or clicking a result other than Finder in the Spotlight list. If this happens: Press Escape, repeat steps 6 and 7, then press Enter only when the result labeled "Finder" is highlighted.

---

9. In Finder, navigate to this exact folder:

   ```
   /Users/coreyalejandro/Projects/the-living-constitution-2.0/modules/nanochat/
   ```

   **What you will see:** The folder contents appear. You see a file named `INSTALL.ipynb`.

   Likely mistake: Navigating to a similarly named folder instead of the exact path. If this happens: Press Command+Shift+G in the Finder window to open the "Go to Folder" dialog, paste `/Users/coreyalejandro/Projects/the-living-constitution-2.0/modules/nanochat/` into the dialog, and press Enter.

---

10. Drag the file named `INSTALL.ipynb` from the Finder window into the Colab tab labeled "Google Colab" and release it.
    **What you will see:** The file moves into the tab labeled "Google Colab".

    Likely mistake: Dropping the file onto the wrong location, such as another folder, instead of directly onto the Colab tab. If this happens: Navigate back to the nanochat folder in Finder and drag INSTALL.ipynb directly onto the browser tab at the top of the screen that says "Google Colab."

---

11. STOP AND WAIT until numbered cells appear on the Colab page.
    **What you will see:** Numbered cells appear. Each cell has a play button on its edge.

---

12. Find the button in the Colab toolbar that controls the runtime connection.
    If the button is labeled "Connect": click it. Then wait 10 seconds.
    If the button is labeled "Reconnect": click it. Then wait 10 seconds.
    If the button shows "RAM" and "Disk" bars: skip to step 13.
    **What you will see:** The button changes to show "RAM" and "Disk" bars.

    Likely mistake: Clicking "Run all" before the runtime is connected. If this happens: Close any dialog that appears, find the Connect or Reconnect button in the toolbar and click it first, then wait for the RAM and Disk bars to appear.

---

13. Click the menu item labeled "Runtime" in the Colab menu bar.
    **What you will see:** A dropdown menu opens showing Runtime options.

    Likely mistake: Clicking a different menu item in the Colab menu bar instead of "Runtime." If this happens: Click somewhere else on the page to close any open menu, then look at the Colab menu bar and click the item labeled exactly "Runtime."

---

14. Click the menu item labeled "Change runtime type".
    **What you will see:** A dialog box titled "Change runtime type" opens.

    Likely mistake: Clicking "Restart session" or another Runtime menu item instead of "Change runtime type." If this happens: Press Escape to close the menu, click "Runtime" in the menu bar again, then click "Change runtime type."

---

15. Click the dropdown menu labeled "Hardware accelerator".
    **What you will see:** A list of accelerator options appears.

    Likely mistake: Clicking inside the dialog box without clicking the dropdown labeled "Hardware accelerator." If this happens: Look for a control with a label that reads "Hardware accelerator" and click directly on the dropdown arrow paired with it.

---

16. Click the option labeled "T4 GPU".
    **What you will see:** The option labeled "T4 GPU" is highlighted.

    Likely mistake: Clicking a different option in the list, such as "None" or "TPU." If this happens: Click the dropdown again and click the option labeled exactly "T4 GPU."

---

17. Click the button labeled "Save".
    **What you will see:** The dialog closes. The Colab toolbar shows "RAM" and "Disk" bars within 5 seconds.

    Likely mistake: Clicking "Cancel" instead of "Save." If this happens: Open the Runtime menu again, click "Change runtime type," and repeat steps 15, 16, and 17.

---

18. Click the button labeled "Files" in the Colab sidebar.
    **What you will see:** A Files panel opens showing the Colab filesystem.

    Likely mistake: Clicking a different button in the Files panel instead of the one that opens the Files panel. If this happens: Move your pointer slowly across each icon in the Colab sidebar until a tooltip reading "Files" appears, then click that icon.

---

19. Look in the Files panel for a folder named `drive`.
    If you see a folder named `drive`: skip to step 24.
    If you do not see a folder named `drive`: continue to step 20.

---

20. Click the button labeled "Mount Drive" in the Files panel. This button shows a Google Drive logo.
    **What you will see:** A permission dialog appears.

    Likely mistake: Clicking a different button in the Files panel instead of "Mount Drive." If this happens: Look for a button in the Files panel showing a Google Drive logo, pause on it to confirm a tooltip reading "Mount Drive" appears, then click it.

---

21. Click the button labeled "Connect to Google Drive".
    **What you will see:** A dialog appears asking you to confirm your Google account.

    Likely mistake: Closing the permission dialog instead of clicking "Connect to Google Drive." If this happens: Click the "Mount Drive" button in the Files panel again to reopen the permission dialog, then click "Connect to Google Drive."

---

22. Click the email address `your Google account email address` in the account selection dialog.
    **What you will see:** An authorization screen appears.

    Likely mistake: Clicking the wrong account if multiple Google accounts appear in the list. If this happens: Click "Use another account" and sign in with the Google account you want to use for this project.

---

23. Click the button labeled "Allow".
    STOP AND WAIT until a folder named `drive` appears in the Files panel.
    **What you will see:** A folder named `drive` appears in the Files panel.

    Likely mistake: Clicking "Cancel" or closing the authorization screen instead of clicking "Allow." If this happens: Open the Files panel again, click "Mount Drive," and proceed through the account selection and permission screens until you can click "Allow."

---

24. Click the menu item labeled "Runtime" in the Colab menu bar.
    **What you will see:** The Runtime dropdown opens.

    Likely mistake: Clicking a different menu item in the Colab menu bar instead of "Runtime." If this happens: Click somewhere else to close any open menu, then click the item labeled "Runtime" in the Colab menu bar.

---

25. Click the menu item labeled "Run all".
    If a dialog appears labeled "Warning: This notebook was not authored by Google": click the button labeled "Run anyway".
    **What you will see:** Cells begin running one at a time. Each running cell shows a spinning indicator.

    Likely mistake: Clicking the button labeled "Run cell" on a single cell instead of selecting "Run all" from the Runtime menu. If this happens: Click the Runtime menu and select "Run all" to run every cell from the beginning in order.

---

26. STOP AND WAIT. Do not click anything else. Do not close the tab. Do not close your laptop lid.
    This will take between 15 and 45 minutes.
    **What you will see when done:** Every cell shows a green checkmark. No cell shows a spinning indicator.

    Likely mistake: Closing the Colab tab or putting the laptop to sleep before all cells finish. If this happens: Reopen the Colab tab from your browser history, check which cells show a green checkmark, and re-run starting from the first cell that does not show a green checkmark.

---

27. Click the folder named `drive` in the Files panel.
    **What you will see:** The contents of the `drive` folder appear.

    Likely mistake: Clicking a different folder in the Files panel instead of the folder named exactly "drive." If this happens: Scroll the Files panel until you see the folder named "drive" and click it.

---

28. Click the folder named `MyDrive`.
    **What you will see:** The contents of the `MyDrive` folder appear.

    Likely mistake: Clicking a folder other than "MyDrive" inside the "drive" folder. If this happens: Click the back arrow or the "drive" folder name to go back, then click the folder named "MyDrive."

---

29. Click the folder named `nanochat_models`.
    **What you will see:** One or more files ending in `.pt` or `.bin` appear. Write down the exact name of the most recent file.
    Example: `ckpt_step_5000.pt`

    Likely mistake: Clicking a folder with a similar name instead of the folder named exactly "nanochat_models." If this happens: Click the back arrow to go back to MyDrive and look for a folder named exactly "nanochat_models."

---

30. Control-click on the checkpoint file you identified in step 29.
    **What you will see:** A context menu appears listing file actions.

    Likely mistake: Single-clicking the file instead of Control-clicking it. If this happens: The file is selected but no menu appears. Hold the Control key and click the file name at the same time to open the context menu.

---

31. Click the menu item labeled "Copy path".
    **What you will see:** The menu closes. The full path is now in your clipboard. It looks like: `/content/drive/MyDrive/nanochat_models/ckpt_step_5000.pt`

    Likely mistake: Clicking "Download" or another menu item instead of "Copy path." If this happens: Press Escape to close the menu, Control-click the file again, then click "Copy path."

---

32. Press the Command key and the Space key at the same time.
    **What you will see:** The Spotlight search bar appears.

    Likely mistake: Pressing only the Command key without holding it while pressing Space. If this happens: Release all keys, then press and hold the Command key, then press the Space key while still holding Command, then release both keys.

---

33. Type the word `Terminal` into the Spotlight search bar.
    **What you will see:** A result labeled "Terminal" appears.

    Likely mistake: Typing a word other than the exact word Terminal, such as "term" or "console." If this happens: Press Escape, press Command and Space again to reopen Spotlight, then type the word Terminal.

---

34. Press Enter.
    **What you will see:** A Terminal window opens.

    Likely mistake: Pressing a different key or clicking a result other than Terminal in the Spotlight list. If this happens: Press Escape, repeat steps 32 and 33, then press Enter only when the result labeled "Terminal" is highlighted.

---

35. Type this command into Terminal, replacing the example path with the path you copied in step 31, then press Enter:

    ```
    echo "NANOCHAT_CHECKPOINT=/content/drive/MyDrive/nanochat_models/ckpt_step_5000.pt" >> /Users/coreyalejandro/Projects/the-living-constitution-2.0/.env
    ```

    **What you will see:** The Terminal prompt returns. No other output is expected.

    Likely mistake: Forgetting to replace the example path with the path you copied in step 31 before pressing Enter. If this happens: Press the up-arrow key to bring back the command, select and delete the example path, paste the path you copied in step 31, then press Enter.

---

36. Type this command into Terminal, then press Enter:

    ```
    cd /Users/coreyalejandro/Projects/the-living-constitution-2.0
    ```

    **What you will see:** The Terminal prompt changes to show the project folder name.

    Likely mistake: Mistyping the path so the folder is not found. If this happens: Press the up-arrow key to bring back the command, compare it character by character to the guide, correct any differences, then press Enter.

---

37. Type this command into Terminal, then press Enter:

    ```
    git add .env modules/nanochat/ && git commit -m "NANOCHAT: checkpoint trained, AC-001 complete" && git push origin main
    ```

    STOP AND WAIT until you see a line that contains `main -> main`.
    **What you will see:** A line that says `main -> main`. The push is complete.

    Likely mistake: Pressing Enter before finishing typing the full command. If this happens: Wait for the Terminal prompt to return, then type the full command again from the beginning.

---

38. Type this command into Terminal, then press Enter:

    ```
    tlc
    ```

    **What you will see:** The TLC terminal interface starts. You see a prompt labeled `tlc ❯`.

    Likely mistake: Typing `tlc` without first being in the correct project directory. If this happens: Type `cd /Users/coreyalejandro/Projects/the-living-constitution-2.0` and press Enter, then type `tlc` and press Enter again.

---

## YOU ARE DONE WITH BUCKET 1

When step 38 is complete:
- nanochat has a trained checkpoint
- The checkpoint is saved permanently in your Google Drive
- TLC 2.0 registry is updated
- The change is on GitHub

The next step (Bucket 2 — LLM Council with OpenRouter) is now unlocked.
Your OpenRouter key was saved in a previous session.
To activate the council, start TLC and type `/council`.

</default-directions>

---

## IF SOMETHING GOES WRONG

Do not try to fix it yourself. Come back to this terminal (Hermes) and copy the exact error message you see on screen. That is all you need to do. I will diagnose it from there.

PROBLEM: Colab shows "Runtime disconnected"
WHAT TO DO: Click the "Runtime" menu, then click "Run all" again. Do not close the tab.

PROBLEM: A cell shows a red error message
WHAT TO DO: Screenshot it or copy the text. Bring it back here.

PROBLEM: The folder named `drive` never appears after step 23
WHAT TO DO: Press Command+R to refresh the Colab page. Then repeat steps 18 through 23.

PROBLEM: No files ending in `.pt` or `.bin` appear in step 29
WHAT TO DO: Go back to step 26. The run may not have completed. Check whether every cell shows a green checkmark or a red error mark.

---

## WHAT EACH PIECE IS — PLAIN LANGUAGE

nanochat is a small language model that you will own completely. You train it. You control it. No API key needed after training. It is the model that TLC 2.0 uses to run local governance decisions without sending anything to Anthropic, OpenAI, or anyone else.

The governance-harness probes (I1-I8) run against this checkpoint. Once you have the checkpoint, those probes can run and produce real scores. Those real scores are the evidence that makes those modules no longer unverified.

That is the chain: train nanochat → run probes → get scores → update truth_status. All three unverified modules advance with one Colab session.

---

## WORD LIST

**address bar**
The long rectangle in a browser that shows the current web address. You click it to type a new address.

**cell**
One block of code inside a Colab notebook. Each cell can be run independently. A running cell shows a spinning indicator. A finished cell shows a green checkmark.

**checkpoint**
A saved copy of a trained model's learned weights. Checkpoint files end in .pt or .bin.

**ckpt_step_5000.pt**
An example checkpoint filename. Your actual file will have a similar name ending in .pt or .bin. The number records the training step when the file was saved.

**clipboard**
A holding area that stores the last thing you copied. Pressing Command+V pastes from the clipboard.

**Colab**
Google Colaboratory. A free web-based service for running Python notebooks. No installation required.

**commit**
A saved record of changes made to a project at a specific point in time.

**context menu**
A small menu that appears when you control-click on something. It shows actions available for that item.

**directory**
A named storage location on your computer that can hold files and other directories. Also called a folder.

**drive**
The name of the folder that appears in the Colab Files panel when Google Drive is connected.

**Files panel**
A panel in the Colab sidebar that shows the files and folders available in the current Colab session.

**Finder**
The macOS application that lets you view and open files and folders on your computer.

**folder**
A named storage location on your computer. Also called a directory.

**version control**
A system that records and stores changes made to project files. The commands in steps 36 and 37 use this system.

**GPU**
Graphics Processing Unit. A chip designed for fast parallel computation. Required for training neural networks in a practical amount of time.

**Google Drive**
Google's cloud storage service. Files saved here are kept even after a Colab session ends.

**INSTALL.ipynb**
The Colab notebook file included with the nanochat module. Running all its cells trains the nanochat checkpoint.

**module**
One project or component registered in TLC 2.0. Each module has a truth_status value.

**MyDrive**
The primary folder inside Google Drive. It appears inside the drive folder when Google Drive is connected in Colab.

**nanochat_models**
The folder inside MyDrive where the nanochat training script saves checkpoint files.

**notebook**
A file ending in .ipynb that contains runnable code blocks and text. Used in Colab.

**path**
The full address of a file or folder on a computer. Example: /Users/coreyalejandro/Projects/...

**probe**
A trained scoring tool that measures a specific property of the nanochat model using its internal activations.

**push**
The action of sending saved commits to GitHub so they are stored remotely.

**repository**
A tracked collection of project files. Often shortened to repo.

**runtime**
The computing environment that runs your Colab notebook. Includes CPU, GPU (if selected), and temporary file storage.

**Spotlight**
The macOS search tool. Press Command+Space to open it.

**T4 GPU**
A free GPU available in Google Colab. Sufficient to train nanochat in 15 to 45 minutes.

**Terminal**
The macOS application that lets you type commands directly to your computer.

**TLC**
A management system that tracks and verifies AI research modules. Abbreviated from a project name.

**truth_status**
The classification assigned to a TLC module: working, partial, draft, unverified, or planned.

**unverified**
A truth_status value meaning the module has not yet been tested or confirmed to meet its requirements.
