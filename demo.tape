# vhs tape — record the cclive demo as demo.gif
# Install vhs:    brew install vhs
# Render:         vhs demo.tape       (produces demo.gif in repo root)

Output demo.gif

Set FontSize 16
Set Width 1100
Set Height 280
Set Theme "Dracula"
Set Padding 18
Set TypingSpeed 35ms
Set PlaybackSpeed 1.0

# Simulate a Claude Code prompt by piping fake stdin and printing the line
# four times so the rotating-ticker highlight is visible advancing.

Type "# cclive — Claude Code status line for live tickers"
Enter
Sleep 800ms

Type "echo '{\"workspace\":{\"current_dir\":\"/repo/cclive\"}}' | cclive"
Enter
Sleep 1.2s

Type "echo '{\"workspace\":{\"current_dir\":\"/repo/cclive\"}}' | cclive"
Enter
Sleep 1.2s

Type "echo '{\"workspace\":{\"current_dir\":\"/repo/cclive\"}}' | cclive"
Enter
Sleep 1.2s

Type "echo '{\"workspace\":{\"current_dir\":\"/repo/cclive\"}}' | cclive"
Enter
Sleep 2s
