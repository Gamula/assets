-=-
  (docs): GitHub Script (ESM) ->
-=-
  <>  - name: "[step]: Runs a Script"
  .=    id: example
  .=    uses: actions/github-script@v7
  .=    with:
  .=    script: |
  .=      const { invoke } = await import("${{ github.workspace }}/actions/scripts/${{ github.action }}.js")
  .=      return await invoke(...arguments)
-=-
