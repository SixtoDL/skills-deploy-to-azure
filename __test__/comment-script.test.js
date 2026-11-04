const fs = require('fs')
const path = require('path')

const workflow = fs.readFileSync(
  path.join(__dirname, '../.github/workflows/comment-script.yml'),
  'utf8'
)
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
const runScript = new AsyncFunction('github', 'context', workflow.split('script: |')[1])

describe('Comment workflow', () => {
  const context = {
    issue: { number: 42 },
    repo: { owner: 'owner', repo: 'repo' }
  }

  it('creates a comment on the opened issue without requiring a project', async () => {
    const createComment = jest.fn().mockResolvedValue({})

    await runScript({ issues: { createComment } }, context)

    expect(createComment).toHaveBeenCalledTimes(1)
    expect(createComment).toHaveBeenCalledWith({
      issue_number: 42,
      owner: 'owner',
      repo: 'repo',
      body: "🎉 You've created this issue comment using GitHub Script!!!"
    })
  })

  it('propagates a failed comment request', async () => {
    const error = new Error('Comment request failed')
    const createComment = jest.fn().mockRejectedValue(error)

    await expect(runScript({ issues: { createComment } }, context)).rejects.toThrow(error)
  })
})
