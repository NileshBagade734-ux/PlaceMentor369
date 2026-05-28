async function fetchSavedJobs() {

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/student/saved-jobs",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        const container =
            document.getElementById("savedJobsContainer");

        container.innerHTML = "";

        if (!data.savedJobs.length) {

            container.innerHTML = `
                <p class="text-slate-500">
                    No saved jobs yet.
                </p>
            `;

            return;
        }

        data.savedJobs.forEach((job) => {

            container.innerHTML += `
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

                    <div class="flex justify-between items-start mb-4">

                        <div>
                            <h3 class="text-lg font-semibold text-slate-900">
                                ${job.title}
                            </h3>

                            <p class="text-slate-500 text-sm">
                                ${job.company}
                            </p>
                        </div>

                        <button
                            onclick="removeSavedJob('${job._id}')"
                            class="text-yellow-500 text-xl"
                        >
                            🔖
                        </button>

                    </div>

                    <p class="text-sm text-slate-600 mb-4">
                        ${job.description || "No description available"}
                    </p>

                </div>
            `;
        });

    } catch (error) {

        console.log(error);
    }
}

async function removeSavedJob(jobId) {

    try {

        const token = localStorage.getItem("token");

        await fetch(
            `http://localhost:5000/api/student/jobs/${jobId}/save`,
            {
                method: "DELETE",

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        fetchSavedJobs();

    } catch (error) {

        console.log(error);
    }
}

fetchSavedJobs();