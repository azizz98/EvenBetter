export const onWorkflowsTabOpened = () => {
  addExportActionButtons();
  addImportButton();
};

const addImportButton = () => {
  const header = document.querySelector(".c-table-header__new");
  if (!header) return;

  const importButton = header.querySelector(".c-button").cloneNode(true);
  importButton.querySelector(".c-button__label").innerText = "Import";
  importButton.id = "workflow-import";

  importButton.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        createWorkflow(data.data.workflow.definition)

        // we need to re-add the buttons after the new workflow is created
        setTimeout(() => {
          addExportActionButtons();
        }, 10);
      };
      reader.readAsText(file);
    });

    document.body.prepend(input);
    input.click();
    input.remove();
  });

  header.appendChild(importButton);
};

const addExportActionButtons = () => {
  const items = document.querySelectorAll(".c-table__item-row");
  if (!items) return;

  items.forEach((item) => {
    item.querySelector("#workflow-export")?.remove();

    const actions = item.querySelector(".c-workflow-table-item__actions");
    if (!actions) return;

    const workflowID = item.querySelector(
      ".c-item-cell[data-column-id=id]"
    ).textContent;

    const deleteButton = actions.children[0];
    deleteButton.id = "workflow-delete";

    const exportButton = deleteButton.cloneNode(true);
    exportButton.querySelector(".c-button__label").innerText = "Export";
    exportButton.id = "workflow-export";

    exportButton.addEventListener("click", (e) => {
      e.stopPropagation();

      getWorkflowByID(workflowID).then((response) => {
        const json = JSON.stringify(response, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "workflow-" + response.data.workflow.name + ".json";
        a.click();
      });
    });

    actions.appendChild(exportButton);
  });
};

export const getWorkflowByID = async (id) => {
  const payload = {
    operationName: "workflow",
    query: `query workflow($id: ID!) {\n  workflow(id: $id) {\n    ...workflowFull\n  }\n}\nfragment workflowFull on Workflow {\n  ...workflowMeta\n  definition\n}\nfragment workflowMeta on Workflow {\n  __typename\n  id\n  kind\n  name\n}`,
    variables: {
      id: id,
    },
  };

  return fetch("http://127.0.0.1:8080/graphql", {
    body: JSON.stringify(payload),
    method: "POST",
    headers: {
      Authorization:
        "Bearer " +
        JSON.parse(localStorage.getItem("CAIDO_AUTHENTICATION")).accessToken,
    },
  }).then((response) => response.json());
};

const createWorkflow = (data) => {
  const payload = {
    operationName: "createWorkflow",
    query: `mutation createWorkflow($input: CreateWorkflowInput!) { \n createWorkflow(input: $input) { \n error { \n ... on WorkflowUserError { \n ...workflowUserErrorFull \n } \n ... on OtherUserError { \n ...otherUserErrorFull \n } \n } \n workflow { \n ...workflowFull \n } \n } \n} \nfragment workflowUserErrorFull on WorkflowUserError { \n ...userErrorFull \n nodeId \n message \n reason \n} \nfragment userErrorFull on UserError { \n __typename \n code \n} \nfragment otherUserErrorFull on OtherUserError { \n ...userErrorFull \n} \nfragment workflowFull on Workflow { \n __typename \n id \n kind \n name \n definition \n}`,
    variables: {
      input: {
        definition: {
          ...data
        },
      },
    },
  };

  fetch("http://127.0.0.1:8080/graphql", {
    body: JSON.stringify(payload),
    method: "POST",
    headers: {
      "Authorization": "Bearer " + JSON.parse(localStorage.getItem("CAIDO_AUTHENTICATION")).accessToken,
    },
  });
};

