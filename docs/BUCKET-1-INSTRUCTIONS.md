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

2. Click the address bar. The address bar is the long rectangle that shows the current web address.
   **What you will see:** The address bar becomes highlighted.

3. Type exactly this into the address bar:

   ```
   https://colab.research.google.com
   ```

   **What you will see:** The address appears in the address bar as you type.

4. Press Enter.
   **What you will see:** The Google Colab homepage loads.

5. If you see a button labeled "Sign in": click it and sign in using `your Google account email address`.
   If you do not see a button labeled "Sign in": skip to step 6.
   **What you will see:** You are signed in and the Colab homepage is visible.

6. Press the Command key and the Space key at the same time.
   **What you will see:** The Spotlight search bar appears.

7. Type the word `Finder` into the Spotlight search bar.
   **What you will see:** A result labeled "Finder" appears in the search results.

8. Press Enter.
   **What you will see:** A new Finder window opens.

9. In Finder, navigate to this exact folder:

   ```
   /Users/coreyalejandro/Projects/the-living-constitution-2.0/modules/nanochat/
   ```

   **What you will see:** The folder contents appear. You see a file named `INSTALL.ipynb`.

10. Drag the file named `INSTALL.ipynb` from the Finder window into the Colab tab labeled "Google Colab" and release it.
    **What you will see:** The file moves into the tab labeled "Google Colab".

11. STOP AND WAIT until numbered cells appear on the Colab page.
    **What you will see:** Numbered cells appear. Each cell has a play button on its edge.

12. Find the button in the Colab toolbar that controls the runtime connection.
    If the button is labeled "Connect": click it. Then wait 10 seconds.
    If the button is labeled "Reconnect": click it. Then wait 10 seconds.
    If the button shows "RAM" and "Disk" bars: skip to step 13.
    **What you will see:** The button changes to show "RAM" and "Disk" bars.

13. Click the menu item labeled "Runtime" in the Colab menu bar.
    **What you will see:** A dropdown menu opens showing Runtime options.

14. Click the menu item labeled "Change runtime type".
    **What you will see:** A dialog box titled "Change runtime type" opens.

15. Click the dropdown menu labeled "Hardware accelerator".
    **What you will see:** A list of accelerator options appears.

16. Click the option labeled "T4 GPU".
    **What you will see:** The option labeled "T4 GPU" is highlighted.

17. Click the button labeled "Save".
    **What you will see:** The dialog closes. The Colab toolbar shows "RAM" and "Disk" bars within 5 seconds.

18. Click the button labeled "Files" in the Colab sidebar.
    **What you will see:** A Files panel opens showing the Colab filesystem.

19. Look in the Files panel for a folder named `drive`.
    If you see a folder named `drive`: skip to step 24.
    If you do not see a folder named `drive`: continue to step 20.

20. Click the button labeled "Mount Drive" in the Files panel. This button shows a Google Drive logo.
    **What you will see:** A permission dialog appears.

21. Click the button labeled "Connect to Google Drive".
    **What you will see:** A dialog appears asking you to confirm your Google account.

22. Click the email address `your Google account email address` in the account selection dialog.
    **What you will see:** An authorization screen appears.

23. Click the button labeled "Allow".
    STOP AND WAIT until a folder named `drive` appears in the Files panel.
    **What you will see:** A folder named `drive` appears in the Files panel.

24. Click the menu item labeled "Runtime" in the Colab menu bar.
    **What you will see:** The Runtime dropdown opens.

25. Click the menu item labeled "Run all".
    If a dialog appears labeled "Warning: This notebook was not authored by Google": click the button labeled "Run anyway".
    **What you will see:** Cells begin running one at a time. Each running cell shows a spinning indicator.

26. STOP AND WAIT. Do not click anything else. Do not close the tab. Do not close your laptop lid.
    This will take between 15 and 45 minutes.
    **What you will see when done:** Every cell shows a green checkmark. No cell shows a spinning indicator.

27. Click the folder named `drive` in the Files panel.
    **What you will see:** The contents of the `drive` folder appear.

28. Click the folder named `MyDrive`.
    **What you will see:** The contents of the `MyDrive` folder appear.

29. Click the folder named `nanochat_models`.
    **What you will see:** One or more files ending in `.pt` or `.bin` appear. Write down the exact name of the most recent file.
    Example: `ckpt_step_5000.pt`

30. Control-click on the checkpoint file you identified in step 29.
    **What you will see:** A context menu appears listing file actions.

31. Click the menu item labeled "Copy path".
    **What you will see:** The menu closes. The full path is now in your clipboard. It looks like: `/content/drive/MyDrive/nanochat_models/ckpt_step_5000.pt`

32. Press the Command key and the Space key at the same time.
    **What you will see:** The Spotlight search bar appears.

33. Type the word `Terminal` into the Spotlight search bar.
    **What you will see:** A result labeled "Terminal" appears.

34. Press Enter.
    **What you will see:** A Terminal window opens.

35. Type this command into Terminal, replacing the example path with the path you copied in step 31, then press Enter:

    ```
    echo "NANOCHAT_CHECKPOINT=/content/drive/MyDrive/nanochat_models/ckpt_step_5000.pt" >> /Users/coreyalejandro/Projects/the-living-constitution-2.0/.env
    ```

    **What you will see:** The Terminal prompt returns. No other output is expected.

36. Type this command into Terminal, then press Enter:

    ```
    cd /Users/coreyalejandro/Projects/the-living-constitution-2.0
    ```

    **What you will see:** The Terminal prompt changes to show the project folder name.

37. Type this command into Terminal, then press Enter:

    ```
    git add .env modules/nanochat/ && git commit -m "NANOCHAT: checkpoint trained, AC-001 complete" && git push origin main
    ```

    STOP AND WAIT until you see a line that contains `main -> main`.
    **What you will see:** A line that says `main -> main`. The push is complete.

38. Type this command into Terminal, then press Enter:

    ```
    tlc
    ```

    **What you will see:** The TLC terminal interface starts. You see a prompt labeled `tlc ❯`.

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
